import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client.js";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

module.exports = {
    name: "tagall",
    description: STRINGS.tagall.DESCRIPTION,
    extendedDescription: STRINGS.tagall.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tagall",
            ".tagall Hey everyone! You have been tagged in this message hehe.",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            if(BotsApp.chatId === "917838204238-1632576208@g.us"){
                return; // Disable this for Spam Chat
            }
            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            await client.getGroupMetaData(BotsApp.chatId, BotsApp);
            console.log(BotsApp);
            let members = [];
            for (var i = 0; i < BotsApp.groupMembers.length; i++) {
                members[i] = BotsApp.groupMembers[i].id;
            }
            if (BotsApp.isTextReply) {
                client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.tagall.TAG_MESSAGE,
                    MessageType.text,
                    {
                        contextInfo: {
                            stanzaId: BotsApp.replyMessageId,
                            participant: BotsApp.replyParticipant,
                            quotedMessage: {
                                conversation: BotsApp.replyMessage,
                            },
                            mentionedJid: members,
                        },
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            if (args.length) {
                client.sendMessage(
                    BotsApp.chatId,
                    args.join(" "),
                    MessageType.text,
                    {
                        contextInfo: {
                            mentionedJid: members,
                        },
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            client.sendMessage(
                BotsApp.chatId,
                STRINGS.tagall.TAG_MESSAGE,
                MessageType.text,
                {
                    contextInfo: {
                        mentionedJid: members,
                    },
                }
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
        return;
    },
};