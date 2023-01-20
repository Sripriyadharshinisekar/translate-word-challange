var fs = require("fs");
const csv = require("csv-parser");

const originalText = fs.readFileSync("inputs/t8.shakespeare.txt", "utf-8");
const translations = {};
let startTime = new Date();
let initialMemory = process.memoryUsage().heapUsed;
fs.createReadStream("inputs/french_dictionary.csv")
  .pipe(csv({ headers: false }))
  .on("data", async (row) => {
    translations[row["0"]] = row["1"];
  })
  .on("end", () => {
    let endTime = new Date();
    let finalMemory = process.memoryUsage().heapUsed;
    let timeTaken = endTime - startTime;
    let memoryUsed = finalMemory - initialMemory;
    let translatedText = originalText;
    let replacedWords = {};
    for (let original in translations) {
      let translated = translations[original];
      let count = (translatedText.match(new RegExp(original, "g")) || [])
        .length;
      if (count > 0) {
        translatedText = translatedText.replace(
          new RegExp(original, "g"),
          translated
        );
        replacedWords[original] = { translated: translated, count: count };
      }
    }
    fs.writeFileSync("output/t8.shakespeare.translated.txt", translatedText);
    fs.writeFileSync(
      "output/performance.txt",
      `Time to process: ${timeTaken}ms \nMemory used: ${memoryUsed} bytes`
    );

    const createCsvWriter = require("csv-writer").createObjectCsvWriter;
    let csvWriter = createCsvWriter({
      path: "output/frequency.csv",
      header: [
        { id: "english", title: "English Word" },
        { id: "french", title: "French Word" },
        { id: "count", title: "Count" },
      ],
    });
    let data = [];
    for (let original in replacedWords) {
      let word = replacedWords[original];
      data.push({
        english: original,
        french: word.translated,
        count: word.count,
      });
    }
    csvWriter.writeRecords(data).then(() => {
      console.log("Output files created successfully.");
    });
  });
