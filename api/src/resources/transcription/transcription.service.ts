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
          }
        }
      }
      // Fallback: try content[0].text (old format)
      else if (responseData?.content && Array.isArray(responseData.content) && responseData.content.length > 0) {
        const contentItem = responseData.content[0];
        if (contentItem?.text) {
          textContent = contentItem.text;
        }
      }

      // Extract JSON from text (text may contain explanation + JSON)
      if (textContent) {
        
        // Clean the text content - remove any leading/trailing whitespace and newlines
        const cleanedText = textContent.trim();
        
        try {
          // First, try to parse the entire text as JSON
          parsedData = JSON.parse(cleanedText) as N8nParsedDataDto;
        } catch (error) {
          
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
                  
                  try {
                    const testParsed = JSON.parse(possibleJson);
                    // Check if it has the expected structure
                    if (testParsed && (testParsed.pontuacao !== undefined || testParsed.analise !== undefined)) {
                      parsedData = testParsed as N8nParsedDataDto;
                      break;
                    }
                  } catch (parseError) {
                    
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
                          
                          try {
                            const fixedParsed = JSON.parse(fixedJson);
                            if (fixedParsed && (fixedParsed.pontuacao !== undefined || fixedParsed.analise !== undefined)) {
                              parsedData = fixedParsed as N8nParsedDataDto;
                              break;
                            }
                          } catch (fixError) {
                            console.error('Failed to parse fixed JSON:', fixError);
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
            try {
              parsedData = JSON.parse(match[0]) as N8nParsedDataDto;
            } catch (parseError) {
              console.error('❌ Error parsing regex-found JSON:', parseError);
            }
          }
          
          if (!parsedData) {
            ('🔧 Attempting manual extraction of values...');
            
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
              
            } else {
              console.error('❌ Could not extract valid JSON or values from response');
              console.error('📝 Full text content:', cleanedText);
            }
          }
        }
      } else if (typeof responseData === 'object') {
        // Fallback: try to use responseData directly
        ('🔄 Using responseData directly as fallback');
        parsedData = responseData as N8nParsedDataDto;
      }

      if (parsedData) {
        
        // Extract pontuacao (score) - handle "pontuacao": "100%" or "pontuacao": "100" or "pontuacao": 100
        let pontuacao = 0;
        if (parsedData.pontuacao !== undefined && parsedData.pontuacao !== null) {
          if (typeof parsedData.pontuacao === 'string') {
            // Remove % sign and parse
            const cleanScore = parsedData.pontuacao.replace('%', '').trim();
            pontuacao = parseFloat(cleanScore) || 0;
          } else {
            pontuacao = parsedData.pontuacao;
          }
        } else {
        }

        // Ensure pontuacao is between 0 and 100
        pontuacao = Math.max(0, Math.min(100, pontuacao));

        // Extract analise (feedback)
        const analise = parsedData.analise ?? '';

        // Extract transcribed text (if available)
        const transcribedText = parsedData.transcribedText 
          ?? parsedData.text 
          ?? parsedData.transcricao
          ?? '';

        const result = {
          score: Math.round(pontuacao),
          transcribedText,
          feedback: analise,
        };
        
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

