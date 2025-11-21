import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptionController } from './transcription.controller';
import { TranscriptionService } from './transcription.service';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { TranscribeAudioDto } from './dtos/transcribe-audio.dto';

const mockTranscriptionService = {
  transcribeAudio: jest.fn(),
};

describe('TranscriptionController', () => {
  let controller: TranscriptionController;
  let service: typeof mockTranscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranscriptionController],
      providers: [
        {
          provide: TranscriptionService,
          useValue: mockTranscriptionService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TranscriptionController>(TranscriptionController);
    service = module.get(TranscriptionService);
  });

  it('deve receber um arquivo e chamar o serviço de transcrição', async () => {
    const mockFile = {
      fieldname: 'audio',
      originalname: 'audio.webm',
      mimetype: 'audio/webm',
      buffer: Buffer.from('conteudo'),
      size: 1024,
    } as any;

    const dto: TranscribeAudioDto = { targetWord: 'hello' };
    const expectedResult = { score: 95, transcribedText: 'hello', feedback: 'Good job' };

    mockTranscriptionService.transcribeAudio.mockResolvedValue(expectedResult);

    const result = await controller.transcribe(mockFile, dto);

    expect(result).toEqual(expectedResult);
    expect(service.transcribeAudio).toHaveBeenCalledWith(mockFile, 'hello');
  });
});