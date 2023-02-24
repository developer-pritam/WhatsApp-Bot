import chalk from "chalk";
import String from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import format from "string-format";
import Client from "../sidekick/client.js";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
import OpenAI from "../services/openai";
const ChatGPT = String.chatGPT;


module.exports = {
    name: "gpt",
    description: ChatGPT.DESCRIPTION,
    extendedDescription: ChatGPT.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".gpt Hi! Welcome to BotsApp.",
            '.gpt What is the meaning of life? -q search',
            ".gpt -t",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            let commandList: string[] = [
                "meaning",
                "search",
            ]
            let prompt: string = "";
            let type: string = "search";
            if (args[0] == null && !BotsApp.isTextReply) {
                await client.sendMessage(
                    BotsApp.chatId,
                    ChatGPT.NO_INPUT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            } else if (BotsApp.isTextReply && !BotsApp.replyMessage) {
                await client.sendMessage(
                    BotsApp.chatId,
                    ChatGPT.INVALID_REPLY,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            } else if (BotsApp.isTextReply) {
                prompt = BotsApp.replyMessage;
            } else {
                try {
                    let text: string = BotsApp.body.replace(
                        BotsApp.body[0] + BotsApp.commandName + " ",
                        ""
                    );
                    if (text[0] === "-" && text[1] === "q") {
                        if (text[2] == null) {
                            let counter: number = 1;
                            let message: string = 'Available commands: ';
                            commandList.forEach((command) => {
                                message += `\n${counter}. ${command}`;
                                counter += 1;
                            })
                            await client.sendMessage(
                                BotsApp.chatId,
                                "```" + message + "```",
                                MessageType.text
                            )
                            return;
                        }
                        else {
                            await client.sendMessage(
                                BotsApp.chatId,
                                ChatGPT.NO_INPUT,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                            return;
                        }
                    }
                    let body: string[] = BotsApp.body.split("-q");
                    prompt = body[0].replace(
                        BotsApp.body[0] + BotsApp.commandName + " ",
                        ""
                    );
                    type = body[1].substring(1);
                    if (!commandList.includes(type)) {
                        await client.sendMessage(
                            BotsApp.chatId,
                            "Invalid command. Use .gpt -q to see available commands.",
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        return;
                    }
                } catch (err) {
                    if (err instanceof TypeError) {
                        prompt = BotsApp.body.replace(
                            BotsApp.body[0] + BotsApp.commandName + " ",
                            ""
                        );

                    }
                }
            }

            try {
                const processing: proto.WebMessageInfo = await client.sendMessage(
                    BotsApp.chatId,
                    `Prompt: ${prompt}\nCommand Type: ${type}`,
                    MessageType.text
                );

                // Call OpenAI API
                const response = await OpenAI(prompt, type).catch(err => inputSanitization.handleError(err, client, BotsApp));
                let quote = await client.store.loadMessage(BotsApp.chatId, BotsApp.replyMessageId, undefined);

                await client.sendMessage(
                    BotsApp.chatId,
                    `Chat GPT Response: ${response}`,
                    MessageType.text, {
                    quoted: quote
                }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return await client.deleteMessage(BotsApp.chatId, {
                    id: processing.key.id,
                    remoteJid: BotsApp.chatId,
                    fromMe: true,
                });
            } catch (err) {
                throw err;
            }

        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },
};