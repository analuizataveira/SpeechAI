import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptionService } from './transcription.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

jest.mock('form-data', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      append: jest.fn(),
      getHeaders: jest.fn().mockReturnValue({ 'content-type': 'multipart/form-data' }),
    })),
  };
});

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TranscriptionService', () => {
  let service: TranscriptionService;

  const mockAudioFile = {
    buffer: Buffer.from('fake-audio-content'),
    originalname: 'audio.webm',
    mimetype: 'audio/webm',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://fake-n8n-url.com'),
          },
        },
      ],
    }).compile();

    service = module.get<TranscriptionService>(TranscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transcribeAudio', () => {
    it('deve lançar BadRequestException se arquivo não fornecido', async () => {
      await expect(service.transcribeAudio(null, 'hello')).rejects.toThrow(BadRequestException);
    });

    it('deve processar resposta com NÚMERO', async () => {
      mockedAxios.post.mockResolvedValue({ data: 95 });
      const result = await service.transcribeAudio(mockAudioFile, 'hello');
      expect(result).toEqual({ score: 95 });
    });

    it('deve processar resposta com "pontuacao"', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { pontuacao: 80, analise: 'Bom', transcricao: 'hello' },
      });
      const result = await service.transcribeAudio(mockAudioFile, 'hello');
      expect(result).toEqual({ score: 80, transcribedText: 'hello', feedback: 'Bom' });
    });

    it('deve processar erro do Axios', async () => {
      const axiosError = new Error('Network Error');
      (axiosError as any).isAxiosError = true;
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockedAxios.post.mockRejectedValue(axiosError);

      await expect(service.transcribeAudio(mockAudioFile, 'hello')).rejects.toThrow(BadRequestException);
    });
  });
});