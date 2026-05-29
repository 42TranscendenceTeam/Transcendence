import { Server } from 'socket.io';

const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 3;

export const emitWithRetries = async (
	io: Server,
	event: string,
	chatId: string,
	content: string,
	retries = MAX_RETRIES,
) => {
		return new Promise<void>((resolve, reject) => {
			let attempts = 0;


			const sendEvent = () => {
				attempts++;

				io.to(chatId).emit(event, content, (ack: boolean) => {
					if (ack) {
						console.log(`Acknowledgement received for event: ${event}`);
						resolve();
					} else if (attempts < retries) {
						console.log(`No acknowledgement for event ${event}. Retrying... (${attempts})`);
						setTimeout(sendEvent, RETRY_INTERVAL);
					} else {
						console.log(`Failed to deliver event ${event} after (${retries}) attempts`);
						reject(new Error(`Failed to deliver event ${event} after (${retries}) attempts`));
					}
				});
			};

			sendEvent();
		});
	};
