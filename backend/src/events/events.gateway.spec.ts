import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Socket } from 'socket.io';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let jwtService: { verify: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      verify: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('disconnects unauthorized sockets on connect', () => {
    configService.get.mockReturnValue('secret');
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const client = {
      id: 'socket-1',
      handshake: { headers: {} },
      disconnect: jest.fn(),
      join: jest.fn(),
    } as unknown as Socket;

    gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(client.join).not.toHaveBeenCalled();
  });

  it('registers authenticated sockets using the validated JWT identity', () => {
    configService.get.mockReturnValue('secret');
    jwtService.verify.mockReturnValue({ sub: 'user-123' });

    const client = {
      id: 'socket-2',
      handshake: {
        headers: {
          cookie: 'access_token=test-token',
        },
      },
      disconnect: jest.fn(),
      join: jest.fn(),
    } as unknown as Socket;

    gateway.handleConnection(client);

    expect(client.disconnect).not.toHaveBeenCalled();
    expect(client.join).toHaveBeenCalledWith('user:user-123');
  });
});
