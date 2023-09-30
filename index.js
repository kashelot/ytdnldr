const ytdl = require("ytdl-core");
const yargs = require("yargs");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");

const argv = yargs(process.argv)
    .usage('Usage: $0 -u [url] -f [filename]')
    .alias("u", "url")
    .alias("f", "filename")
    .demandOption(['u'])
    .argv;

ytdl.getInfo(argv.url)
    .then((info) => {
        // const audioInfo = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });

        const filename = `${argv.filename || info.videoDetails.title}.mp3`;

        const stream = ytdl.downloadFromInfo(info, { quality: "highestaudio", filter: "audioonly" });

        return new Promise((resolve, reject) => {
            return ffmpeg(stream)
                .setFfmpegPath("./ffmpeg")
                .save(filename)
                .on('progress', ({ targetSize }) => {
                    readline.cursorTo(process.stdout, 0);

                    process.stdout.write(`${ filename }: ${ targetSize }kb downloaded`);
                })
                .on("error", reject)
                .on("end", resolve);
        });
    })
    .then(() => {
        process.stdout.write("\nDownloading complete");
    })
    .catch((error) => {
        process.stderr.write(error);
    });