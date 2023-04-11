// index.ts (mom)
// * doesn't do anything to obtain or leak your discord token
// Let mom limit your texts. It's better for you after all.

/* &===============================================& */
/* |                    IMPORTS                    | */
/* &===============================================& */

// DISCORD.JS SELFBOT
import {
    Message,
    User,
    Intents,
    Channel,
    DMChannel,
    PartialGroupDMChannel,
    TextChannel,
    ImageURLOptions
} from "discord.js-selfbot-v13";
const Client = require('discord.js-selfbot-v13').Client;

// LOGGING
import {Logger} from "winston";

// KILLING PROCESSES / EXECUTING SHELL COMMANDS (admin / root)
const { PowerShell } = require('node-powershell');
const { exec } = require("child_process");

// FILESYSTEM
const fs = require('fs');
const path = require('path');

// AESTHETICS
const figlet = require('figlet');
import {Chalk} from "chalk"; // TODO: sus...
const chalk = require('chalk');
const winston = require('winston');

// BULLSHIT AESTHETICS
const imageToAscii = require("image-to-ascii");

/* &===============================================& */
/* |                   CONSTANTS                   | */
/* &===============================================& */

const DISCORD_AVATAR_BASE_URL: string = "https://cdn.discordapp.com/"; // base url for discord avatars

const CH_DISCORD: Chalk = chalk.bgHex('#7289DA'); // default discord blue!!!!

// (SHOULD PROBABLY BE) ENVIRONMENT VARIABLES
const FIGLET_FONT: string = "ANSI_Shadow"; // figlet font to use
const FIGLET_FONT_WIDTH: number = 240; // figlet font width
// SRC: https://raw.githubusercontent.com/hIMEI29A/FigletFonts/master/src/ANSI_Shadow.flf
const FIGLET_FLF_PATH: string = "./resources/fonts/ANSI_Shadow.flf"; // path to figlet font file
const WIDTH: number = 20; // # of character columns
const HEIGHT : number = 20; // # of character rows

const DISCORD_AVATAR_FORMAT: string = "png"; // discord avatar format
const DISCORD_AVATAR_SIZE: number = 1024; // discord avatar side length in pixels ( $2^N given N < 2 && N < 4096$

// THRESHOLDS FOR RATE-LIMITING
const IMG_ASCII_FAIL_TOLERANCE: number = 25; // number of unfinished message events allowed before stopping and resetting the process.

let LOG_LEVEL: string = "debug";
let TOKEN: string = "";

// console.log(chalk.red.inverse('NOTHING') + chalk.italic('loading nothing, config.json is loaded later. lol'));

// initialize env vars
console.log(chalk.cyan.inverse('DOTENV') + chalk.bold(' loading environment variables...'));
require('dotenv').config();

/* &===============================================& */
/* |                 DEBUG ENV VARS                | */
/* &===============================================& */

let DEBUG : boolean = false;
let DUMP_DM_JSON : boolean = false;
let dmLog: Logger; // winston logger for DMs if DUMP_DM_JSON is true

if(process.env.DEBUG && (process.env.DEBUG === 'true' || process.env.DEBUG === '1')) {
    LOG_LEVEL = 'debug';
    console.log(chalk.magenta.bold("[DEBUG] ") + chalk.italic.gray('set LOG_LEVEL to ') + chalk.underline.white.bold(LOG_LEVEL));
    DEBUG = true;
}

if(process.env.DUMP_DM_JSON && (process.env.DUMP_DM_JSON === 'true' || process.env.DUMP_DM_JSON === '1')) {
    DUMP_DM_JSON = true;
    dmLog = winston.createLogger({
        level: 'silly',
        transports: [
            new winston.transports.File({
                format: winston.format.printf((info: any) => { return `[${info.timestamp}]\n${info.message}` }),
                filename: 'logs/dms.log',
                level: 'verbose',
                levelOnly: true,
                options: {flags: 'a'}
            })
        ]
    });
}

// check log level dotenv
if(process.env.LOG_LEVEL) {
	// why would I check if its valid?  
	LOG_LEVEL = process.env.LOG_LEVEL;
	console.log(chalk.italic.gray('set LOG_LEVEL to ') + chalk.bold.underline(LOG_LEVEL));
}

// allow token override with env var 
if(process.env.TOKEN) {
	TOKEN = process.env.TOKEN;
	console.log(chalk.italic.gray('set ') + chalk.redBright.bold.underline('TOKEN') + chalk.italic.gray(' via .env file.'));
}

// initialize winston logger
console.log(chalk.yellow.inverse('WINSTON') + chalk.bold(' initializing...'));

// ensure the existence of our logs folder
if(!fs.existsSync('./logs/')) {
	fs.mkdirSync('./logs/');
}

console.log(chalk.keyword('orange').inverse('FIGLET') + chalk.italic(' loading font...'));
// load figlet font
figlet.parseFont(FIGLET_FONT, fs.readFileSync(FIGLET_FLF_PATH, 'utf-8'));

// create winston logger
const log = winston.createLogger({
	level: LOG_LEVEL,
	transports: [
		new winston.transports.Console({format: winston.format.cli(winston.format.colorize())}),
		new winston.transports.File({format: winston.format.json(winston.format.simple()), filename: 'logs/all.log', level: 'silly', options: {flags: 'a'}})
	]
});

log.info(chalk.green.bold('winston loaded.'));


// no overhead involved idk what ur talking about 

/**
 * Prints a nice header to the console.
 * using figlet and chalk for prettier output.
 * parses package.json for name, version, description, etc.
 * @param logLevel sometimes log level determines the way we print this header
 */
function showHeader(logLevel: string = "info") : void {
    // get fonky text width
    const TEXT_WIDTH : number = FIGLET_FONT_WIDTH;

    // read package.json
    const pJSON = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
    console.log("&" + "=".repeat(TEXT_WIDTH / 2) + "&");
    console.log("\n");
    console.log(figlet.textSync(pJSON.name, {
        font: FIGLET_FONT,
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: TEXT_WIDTH,
        whitespaceBreak: false
    }));
    console.log("&" + "=".repeat(TEXT_WIDTH / 2) + "&");
    // finished printing border, now print info
    console.log(chalk.italic.gray("author      : ") + chalk.underline(pJSON.author));
    log.info("Thanks for making this " + chalk.bold(pJSON.author) + "!");
    console.log(chalk.italic.gray("version     : ") + chalk.bold(pJSON.version));
    console.log(chalk.italic.gray("description : ") + chalk.bold(pJSON.description));
    log.verbose("Hey, that's me!");
    log.verbose("I'm " + chalk.bold(pJSON.author) + " and I made this.");

    // print too much stuff for debug mode
    if(logLevel === "verbose" || logLevel === "debug" || logLevel === "silly") {
        log.debug("Special extra summary for debug mode:");
        console.log(chalk.italic.gray("main        : ") + chalk.bold(pJSON.main));
        console.log(chalk.italic.gray("license     : ") + chalk.bold(pJSON.license));
        console.log(chalk.italic.gray("dependencies: ") + chalk.bold(pJSON.dependencies));

    }

    log.debug("Header printed with log level " + chalk.bold(logLevel));
}

interface Config {
    token: string,
    periodMins: number,
    messageLimit: number,
    messageLimitWarn: number,
    cooldownSeconds: number,
    strict: boolean,
    kill: string[]
}

log.info('reading ' + chalk.bold.inverse('config.json') + '...');
 const config = JSON.parse(fs.readFileSync(path.resolve('./config.json'), 'utf-8')) as Config; // modified for /src/ /dist/ modality
log.info("Done.");
// console.log(config);
// @laralove143 sus as fuck... u a snitch for this

// set TOKEN to config.token if not set by .env or flag
if (!TOKEN || TOKEN === '') {
    log.warn("Setting TOKEN by config file");
	TOKEN = config.token;
}

// creating discord bullshit
const client = new Client({
    checkUpdate: false,
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING
    ],
    partials: [
        'CHANNEL' // needed for DMs...?
    ]
  }
);


client.on('ready', async () => {
	log.warn(chalk.hex('#FF69B4').bold("MOM'S HERE"));
});

let sentMessageCount = 0;
let lastMessageEpoch = 0;
let secondsSinceLastMsg = 0;

setInterval(() => {
    sentMessageCount = 0;
    log.info(chalk.bgGreen('GREAT JOB HONEY!') + chalk.italic(' You managed to stop using ') +CH_DISCORD.bold('discord') + ' for ' + chalk.inverse(String((secondsSinceLastMsg / (60)))) + chalk.italic(' minutes!'));
}, config.periodMins * 60 * 1_000);

client.on('messageCreate', async (message: Message) => {

    // ignore non-DMs
    if (message.author.id != client.user?.id) {
        return;
    }

    // set time vars each interval
    secondsSinceLastMsg = Date.now() - lastMessageEpoch;
    lastMessageEpoch = Date.now();


    let timedOut = sentMessageCount > config.messageLimit;

    sentMessageCount += 1;

    if (timedOut) {
        // if strict mommy, murder the offending program
        if(config.strict) {
            log.error("Shooting " + CH_DISCORD.bold('discord') + ' with a ' + chalk.red.bold('9mm') + '.');
            let success = await killByName('discord.exe');
            if(success) {
                log.info(chalk.green('Back of the head.') + chalk.italic(' You\'re') + chalk.bold.red(' GROUNDED BITCH!'));
                log.warn(chalk.italic('act FUCKING natural.'));
            } else {
                log.info(chalk.yellow("FUCKING missed."));
                log.warn("FAILED TO KILL " + CH_DISCORD.bold("discord.exe"));
            }
        }
        if((secondsSinceLastMsg) > config.cooldownSeconds) {
            log.error(chalk.bgRed.bold('SIR!') + "You're still " + chalk.bold.underline("IN THE CORNER") + ' for ' + chalk.red(String((secondsSinceLastMsg) - config.cooldownSeconds)) + ' seconds!');
        }
        log.error(chalk.bgRed.bold("NO MORE MESSAGES!") + "you're " + chalk.red(String(sentMessageCount - config.messageLimit)) + ' over your limit!' + chalk.bold('bad boy!'));

    } else if (sentMessageCount >= config.messageLimitWarn) {
        log.warn(`${config.messageLimit - sentMessageCount} message(s) left until you're UN` + chalk.bold.red('GROUNDED!'));
    }

    if(DEBUG) {
        const jsString : string =  JSON.stringify(message, null, 4);
        log.silly(jsString);
        if(DUMP_DM_JSON && jsString) {
            dmLog?.verbose(jsString);
        }
    }

    // get recipient
    let recipient: User;

    // TODO: We are just ASSUMING the only pertinent channels are DM channels. This is not true.
    //       We need to loop generic Channel objects and handle each appropriately.
    //       This is a TODO for later.

    await client.channels.fetch(message.channelId).then((channel: DMChannel) => {
        log.debug("DM RECIPIENT: " + chalk.bold(channel.recipient.username) + " (" + channel.recipient.id + ")");
        recipient = channel.recipient;
    }).catch((err: Error) => {
        log.error("Error fetching channel: " + err);
        return;
    }).finally(async () => {
        log.debug("Done fetching channel.");

    if(DEBUG) {
        let counter: number = 0;
        let completedCounter: number = 0;

        if(!recipient) {
            log.debug("Recipient is undefined, skipping.");
            return;
        }
        // iterate even if the recipient is not found.
        counter++;

        getDiscordUser_AvatarASCII(recipient).then((ascii: string) => {
            completedCounter++;
            prettyPrintDiscord(recipient, ascii);
        }).catch((err: any) => {
            log.error("Failed to get image -> string from user: " + chalk.keyword("hot pink").inverse(recipient.username) + " (" + recipient.id + ")");
            log.debug(err);
            completedCounter++;
        });
        }

    });

});


/**
 * Attempts to pretty print from a discord user, provided the image-to-ascii text already generated.
 * @param user the Discord user which defines the pretty print -- accent color, avatar image, etc
 * @param ascii the ascii art of the user's pfp
 */
function prettyPrintDiscord(user: User, ascii: string) {
    log.debug("Successfully got image -> string from user" + user.username + " (" + user.id + ")");
    let img_lines: string[] = ascii.split('\n');
    // print a border around the ascii art
    console.log(chalk.bgWhite.bold("#".repeat(2 * WIDTH + 2)));
    for(let i = 0; i < HEIGHT; i++) {
        console.log(chalk.bgWhite.bold("#") + img_lines[i] + chalk.bgWhite.bold("#"));
    }
    console.log(chalk.bgWhite.bold("#".repeat(2 * WIDTH + 2))); //end border
    console.log(" "); // newline
    log.debug("Getting accent color to create chalk color format...");
    let myColor : number = (typeof (user.accentColor) === "number") ? user.accentColor : 0;
    let chHex: Chalk, chBgHex: Chalk;
    chHex = chalk.white;
    if(myColor === 0) {
        log.warn("User " + user.username + " (" + user.id + ") has no accent color.");
        chBgHex = CH_DISCORD;
    }
    //chHex = chalk.hex(`#${(1/ (myColor !== 0 ? 1 : myColor)).toString(16)}`);  // convert to hexadecimal AFTER getting inverse (with check to avoid div by 0)
    chBgHex = chalk.bgHex(`#${myColor.toString(16)}`); // convert to hexadecimal before passing to chalk

    // &====================&
    //      statistics
    // &====================&

    console.log(chBgHex.white(user.username) + "(" +  chBgHex.inverse.white(user.id) + ")");
    console.log(" "); // newline
    console.log(chalk.bold("Creation Date  : ") + chBgHex(user.createdAt.toDateString()));
    //console.log(chalk.bold("Mutual Friends : ") + chBgHex((user.mutualFriends).size)); // TODO: this is what makes the entire function async
    console.log(chalk.bold("Mutual Servers : ") + chBgHex(user.mutualGuilds.size));

    log.warn("Statistics are minimal right now -- more to come");
}

/**
 * Attempts to use the `image-to-ascii` node package to parse the user's avatar into a colored text string,
 * then returns (not prints) a "rich status" with user information along with generated image
 * @param user the user which should be printed
 */
async function getDiscordUser_AvatarASCII(user: User): Promise<string> {
    return new Promise<string>(async (resolve, reject): Promise<string> => {
        if (!user) {
            reject(`user ${user} is nullable`);
        }

        // TODO: add back non-hardcoded image size & format
        let options: ImageURLOptions = {
            dynamic: true,
            format: 'png',
            size: 1024
        }

        let avatarURL: string | null = user?.displayAvatarURL(options);
        log.debug("Recipient avatar URL: " + avatarURL);

        // try to get ascii art of sender profile image & then print cool status message
        if(!avatarURL) {
            log.debug(`Recipient avatar URL is ${chalk.red("NULL")}, skipping.`);
            log.debug("Recipient: " + chalk.bold(user.username) + " (" + user.id + ")");
            resolve("User avatar URL was null");
        }

        return imageToAscii(avatarURL, {
            colored: true,
            size: {
                height: HEIGHT,
                width: WIDTH
            },
            fit: 'box',
            // invert: true,
            // pixelRatio: 1,
            // ratio: 1,
            // scale: 1,
            // width: 10,
            // height: 10
        }, (err: any, converted: any) => {
            if (err) {
                reject(err);
            }
            resolve(converted);
        });

        // client.users.fetch(user.id).then((usr: User) => {
        //     log.debug("Successfully fetched user " + chalk.bold(usr.username) + " (" + user.id + ")");
        //     if(!usr) {
        //         reject(`user ${usr} is nullable`);
        //     }
        //
        //
        //
        //     usr.avatarURL({format: DISCORD_AVATAR_FORMAT}).then((url: string) => {
        //         avatarURL = url;
        //         if (!avatarURL) {
        //             reject(`user ${usr.username} avatar was null`);
        //         }
        //
        //         log.debug("USER: " + chalk.bold(usr.username) + " (" + usr.id + ")");
        //         log.debug("Getting image from " + avatarURL);
        //         return new Promise<string>((resolve, reject) => {
        //             imageToAscii(avatarURL, {
        //                 colored: true,
        //                 size: {
        //                     height: HEIGHT,
        //                     width: WIDTH
        //                 },
        //                 fit: 'box',
        //                 // invert: true,
        //                 // pixelRatio: 1,
        //                 // ratio: 1,
        //                 // scale: 1,
        //                 // width: 10,
        //                 // height: 10
        //             }, (err: any, converted: any) => {
        //                 if (err) {
        //                     reject(err);
        //                 }
        //                 resolve(converted);
        //             });
        //         });
        //     }).catch((err: any) => {
        //         log.error("Error getting avatar URL for user " + chalk.bold(usr.username) + " (" + usr.id + "): \n" + err);
        //         reject(err);
        //     });
        // });
    });
}

/**
 * Kills a program by name, not PID
 * SOURCE: npm package `kill-process-by-name`
 * @param program the name of the program to kill
 */
async function killByName(program: string): Promise<boolean> {
    log.info(chalk.underline('KILLING ' + program +  '...'));
    return new Promise<boolean>((resolve, reject) => {
        switch(process.platform) {
            case 'win32':
                // windows
                // trying to use powershell to kill the process
                // need to get UAC prompt to work
                const ps = new PowerShell({
                    executionPolicy: 'Bypass',
                    noProfile: true
                });
                ps.addCommand(`Start-Process -WindowStyle hidden cmd -Verb RunAs -ArgumentList '/c taskkill /F /IM ${program} /T'`);
                //ps.addCommand('taskkill /F /IM ' + program + '.exe /T');
                ps.invoke().then((output: any) => {
                    if (output && output.errors && output.errors.length > 0) {
                        log.error(chalk.black.bgRed('Failed to KILL'));
                        reject("failed to kill " + program);
                    } else {
                        log.info(chalk.green.bold('Success. Killed. :)'));
                        resolve(true);
                    }

                }, {admin: true});
                break;
            default: //Linux + Darwin
                exec('pkill -f ' + program, function(error: any, stdout: any, stderror: any) {
                if (error) {
                    log.error(chalk.black.bgRed('Failed to KILL'));
                    reject("failed to kill " + program);
                }
                log.info(chalk.green.bold('Success. Killed. :)'));
                resolve(true);

            });
                break;
        }
    });
}

async function main() {
	await client.login(TOKEN);
}

// Print Header
showHeader(LOG_LEVEL);

// TODO: Remove old Windows UAC Code
// try to elevate if not elevated
// exec('echo', 'MOM is trying to elevate!', function(error: any, stdout: any, stderror: any) {
//     if (error) {
//         log.error(chalk.bold.bgRed('Failed to ELEVATE'));
//         process.exit(1);
//         return;
//     }
//     log.info(chalk.green.bold('Success. Elevated. :)'));
// });

// start
main().then(() => {
    log.info(chalk.green.bold('logged in.'));
}).catch((err: any) => {
    log.error(chalk.red.bold('failed to login: ') + chalk.italic(err));
});