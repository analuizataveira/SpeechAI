import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { ITranscriptionService } from './interfaces/transcription.service.interface';
import { TranscriptionResponseDto } from './dtos/transcription-response.dto';
import { N8nResponseDto, N8nParsedDataDto } from './dtos/n8n-response.dto';

@Injectable()
export class TranscriptionService implements ITranscriptionService {
  private readonly n8nWebhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.n8nWebhookUrl =
      this.configService.get<string>('N8N_WEBHOOK_URL') ||
      'https://speechai.app.n8n.cloud/webhook-test/audio-to-transcribe';
  }

  async transcribeAudio(
    audioFile: any,
    targetWord: string,
  ): Promise<TranscriptionResponseDto> {
    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    try {
      // Create form data to send to n8n webhook
      const formData = new FormData();
      formData.append('audio', audioFile.buffer, {
        filename: audioFile.originalname || 'audio.webm',
        contentType: audioFile.mimetype || 'audio/webm',
      });
      formData.append('targetWord', targetWord);

      // Call n8n webhook
      const response = await axios.post(this.n8nWebhookUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      // Parse response from n8n
      const responseData: N8nResponseDto = response.data;
      console.log('📥 Raw response from n8n webhook:', JSON.stringify(responseData, null, 2));

      // Handle n8n response format: { output: [{ content: [{ type: "output_text", text: "..." }] }] }
      // The text may contain explanation + JSON, so we need to extract the JSON
      let parsedData: N8nParsedDataDto | null = null;
      let textContent: string | null = null;

      // Try to access output[0].content[0].text first (new format)
      if (responseData?.output && Array.isArray(responseData.output) && responseData.output.length > 0) {
        const outputItem = responseData.output[0];
        if (outputItem?.content && Array.isArray(outputItem.content) && outputItem.content.length > 0) {
          const contentItem = outputItem.content.find(item => item.type === 'output_text');
          if (contentItem?.text) {
            textContent = contentItem.text;
            console.log('📝 Found text content from output format:', textContent);
          }
        }
      }
      // Fallback: try content[0].text (old format)
      else if (responseData?.content && Array.isArray(responseData.content) && responseData.content.length > 0) {
        const contentItem = responseData.content[0];
        if (contentItem?.text) {
          textContent = contentItem.text;
          console.log('📝 Found text content from old format:', textContent);
        }
      }

      // Extract JSON from text (text may contain explanation + JSON)
      if (textContent) {
        console.log('🔍 Attempting to parse text content:', textContent);
        
        // Clean the text content - remove any leading/trailing whitespace and newlines
        const cleanedText = textContent.trim();
        
        try {
          // First, try to parse the entire text as JSON
          parsedData = JSON.parse(cleanedText) as N8nParsedDataDto;
          console.log('✅ Successfully parsed entire text as JSON:', parsedData);
        } catch (error) {
          console.log('⚠️ Failed to parse entire text as JSON, attempting to extract JSON...');
          
          // Use regex to find JSON object that contains "pontuacao"
          const jsonRegex = /\{[^{}]*"pontuacao"[^{}]*\}/gs;
          let match = jsonRegex.exec(cleanedText);
          
          if (!match) {
            // If no simple match, try to find any JSON-like structure with braces
            const jsonStartIndex = cleanedText.indexOf('{');
            if (jsonStartIndex !== -1) {
              // Find all possible JSON objects
              let currentIndex = jsonStartIndex;
              while (currentIndex < cleanedText.length) {
                let braceCount = 0;
                let jsonEndIndex = -1;
                let startIndex = currentIndex;
                
                for (let i = currentIndex; i < cleanedText.length; i++) {
                  if (cleanedText[i] === '{') {
                    braceCount++;
                    if (braceCount === 1) startIndex = i;
                  }
                  if (cleanedText[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                      jsonEndIndex = i;
                      break;
                    }
                  }
                }
                
                if (jsonEndIndex !== -1) {
                  const possibleJson = cleanedText.substring(startIndex, jsonEndIndex + 1);
                  console.log('🔧 Testing potential JSON:', possibleJson);
                  
                  try {
                    const testParsed = JSON.parse(possibleJson);
                    // Check if it has the expected structure
                    if (testParsed && (testParsed.pontuacao !== undefined || testParsed.analise !== undefined)) {
                      parsedData = testParsed as N8nParsedDataDto;
                      console.log('✅ Successfully parsed extracted JSON:', parsedData);
                      break;
                    }
                  } catch (parseError) {
                    console.log('⚠️ Failed to parse this JSON candidate:', possibleJson);
                    console.log('⚠️ Parse error:', parseError instanceof Error ? parseError.message : String(parseError));
                    
                    // Try to fix common JSON issues and retry
                    let fixedJson = possibleJson;
                    
                    // Fix incomplete strings by adding missing quotes
                    if (possibleJson.includes('"analise":') && !possibleJson.match(/"analise"\s*:\s*"[^"]*"[,}]/)) {
                      // Find where the analise value starts and ends
                      const analiseMatch = possibleJson.match(/"analise"\s*:\s*"([^"]*)/);
                      if (analiseMatch) {
                        // Try to complete the string
                        const afterAnalise = possibleJson.substring(possibleJson.indexOf(analiseMatch[0]) + analiseMatch[0].length);
                        const nextQuoteIndex = afterAnalise.indexOf('"');
                        if (nextQuoteIndex === -1) {
                          // No closing quote found, add one before the closing brace
                          fixedJson = possibleJson.replace(/([^"]}?)$/, '"$1');
                          console.log('🔧 Attempted to fix incomplete JSON:', fixedJson);
                          
                          try {
                            const fixedParsed = JSON.parse(fixedJson);
                            if (fixedParsed && (fixedParsed.pontuacao !== undefined || fixedParsed.analise !== undefined)) {
                              parsedData = fixedParsed as N8nParsedDataDto;
                              console.log('✅ Successfully parsed fixed JSON:', parsedData);
                              break;
                            }
                          } catch (fixError) {
                            console.log('⚠️ Failed to parse fixed JSON:', fixError instanceof Error ? fixError.message : String(fixError));
                          }
                        }
                      }
                    }
                  }
                  
                  currentIndex = jsonEndIndex + 1;
                } else {
                  break;
                }
              }
            }
          } else {
            // Try to parse the regex match
            console.log('🔧 Found JSON with regex:', match[0]);
            try {
              parsedData = JSON.parse(match[0]) as N8nParsedDataDto;
              console.log('✅ Successfully parsed regex-found JSON:', parsedData);
            } catch (parseError) {
              console.error('❌ Error parsing regex-found JSON:', parseError);
            }
          }
          
          if (!parsedData) {
            console.log('🔧 Attempting manual extraction of values...');
            
            // Try to extract values manually using regex
            const pontuacaoMatch = cleanedText.match(/"pontuacao"\s*:\s*"([^"]*%)"/i) || 
                                 cleanedText.match(/"pontuacao"\s*:\s*"([^"]*\d+[^"]*)"/i) ||
                                 cleanedText.match(/"pontuacao"\s*:\s*(\d+)/i);
            
            const analiseMatch = cleanedText.match(/"analise"\s*:\s*"([^"]*(?:"[^"]*)*)/i);
            
            if (pontuacaoMatch || analiseMatch) {
              parsedData = {
                pontuacao: pontuacaoMatch ? pontuacaoMatch[1] : undefined,
                analise: analiseMatch ? analiseMatch[1] : undefined
              } as N8nParsedDataDto;
              
              console.log('✅ Successfully extracted values manually:', parsedData);
            } else {
              console.error('❌ Could not extract valid JSON or values from response');
              console.error('📝 Full text content:', cleanedText);
            }
          }
        }
      } else if (typeof responseData === 'object') {
        // Fallback: try to use responseData directly
        console.log('🔄 Using responseData directly as fallback');
        parsedData = responseData as N8nParsedDataDto;
      }

      if (parsedData) {
        console.log('🎯 Processing parsed data:', JSON.stringify(parsedData, null, 2));
        
        // Extract pontuacao (score) - handle "pontuacao": "100%" or "pontuacao": "100" or "pontuacao": 100
        let pontuacao = 0;
        if (parsedData.pontuacao !== undefined && parsedData.pontuacao !== null) {
          if (typeof parsedData.pontuacao === 'string') {
            // Remove % sign and parse
            const cleanScore = parsedData.pontuacao.replace('%', '').trim();
            pontuacao = parseFloat(cleanScore) || 0;
            console.log(`📊 Extracted score from string "${parsedData.pontuacao}": ${pontuacao}`);
          } else {
            pontuacao = parsedData.pontuacao;
            console.log(`📊 Extracted score from number: ${pontuacao}`);
          }
        } else {
          console.log('⚠️ No pontuacao found in parsed data');
        }

        // Ensure pontuacao is between 0 and 100
        pontuacao = Math.max(0, Math.min(100, pontuacao));

        // Extract analise (feedback)
        const analise = parsedData.analise ?? '';
        console.log(`💬 Extracted feedback: "${analise}"`);

        // Extract transcribed text (if available)
        const transcribedText = parsedData.transcribedText 
          ?? parsedData.text 
          ?? parsedData.transcricao
          ?? '';
        console.log(`📝 Extracted transcribed text: "${transcribedText}"`);

        const result = {
          score: Math.round(pontuacao),
          transcribedText,
          feedback: analise,
        };
        
        console.log('✅ Processed transcription result:', JSON.stringify(result, null, 2));
        return result;
      } else {
        console.error('❌ parsedData is null or undefined');
      }

      // Fallback: unable to parse response
      return {
        score: 0,
        feedback: 'Unable to parse response from transcription service',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Transcription service error: ${error.message}`,
        );
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to transcribe audio: ${errorMessage}`,
      );
    }
  }
}

