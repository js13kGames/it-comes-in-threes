import { MixArgs } from "rocket/mix"
import { async, charset, lang, src } from "rocket/server/attr"
import { apd, El } from "rocket/server/core"
import { body, head, html, link, meta, script, title, _meta } from "rocket/server/elt"

import { AppServer } from "./app"


export const
  HTML = (_app: AppServer, ...args: MixArgs<El>) =>
    html(lang("en"), apd(
      head(apd(
        title(apd("It Comes in Threes")),

        _meta(charset("utf-8")),
        meta("apple-mobile-web-app-capable", "yes"),
        meta("format-detection", "telephone=no"),
        meta("theme-color", "#000"),
        meta("viewport", "initial-scale=1,user-scalable=no,width=device-width"),

        link("icon", "art/icons/16.png"),
        link("manifest", "manifest.json"),
        link("stylesheet", "threes.css"),

        /*script(nonce(cspNonce), apd(
          `const USER = ${JSON.stringify(user.prop.get())}`
        )),*/
        script(async, src("threes.js")),
      )),
      body(...args)
    ))
