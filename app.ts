/**
 * Goal: Translate 3000 words english to french use DeepL API and save to json file
 */

import to from "await-to-js"
import * as deepl from "deepl-node"
import dotenv from "dotenv"
import fs from "fs"
import { promisify } from "util"
import { z } from "zod"

dotenv.config()

const zodEnv = z.object({
	DEEPL_API_KEY: z.string(),
})
const env = zodEnv.parse(process.env)
const translator = new deepl.Translator(env.DEEPL_API_KEY)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const main = async () => {
	const [err1, englishWords] = await to(
		readFile("./3000-english-words.txt", "utf-8"),
	)
	if (err1) {
		console.error(err1)
		return
	}
	const englishWordsArray = englishWords.split("\r\n")
	const [err2, frenchWordsArray] = await to(
		translator.translateText(englishWordsArray, "en", "fr"),
	)
	if (err2) {
		console.error(err2)
		return
	}
	if (typeof frenchWordsArray === "string") {
		console.error(`List of french words is string: ${frenchWordsArray}`)
		return
	}
	console.assert(
		englishWordsArray.length === frenchWordsArray.length,
		"Length of english words and french words is not equal",
	)
	const jsonEnToFr: Record<string, string> = {}
	const jsonFrToEn: Record<string, string> = {}
	for (let i = 0; i < englishWordsArray.length; i++) {
		jsonEnToFr[englishWordsArray[i]] = frenchWordsArray[i].text
		jsonFrToEn[frenchWordsArray[i].text] = englishWordsArray[i]
	}
	const [err3] = await to(
		writeFile("./enToFr.json", JSON.stringify(jsonEnToFr, null, 2)),
	)
	if (err3) {
		console.error(err3)
		return
	}
	const [err4] = await to(
		writeFile("./frToEn.json", JSON.stringify(jsonFrToEn, null, 2)),
	)
	if (err4) {
		console.error(err4)
		return
	}
}

main()
