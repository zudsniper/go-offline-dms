# `go-offline-dms`
_the successor to my EXTREMELY WELL RECEIVED first version, `go-offline-dms` offers the feature of kind of actually working._  
Sometimes.



![Startup with `DEBUG=1`](https://i.imgur.com/o6BxzRs.png)   
> <i>this is what a startup is supposed to look like. </i> 
  

---

# **`DISCLAIMER`**  
**I DO NOT ENDORSE ANY USE OF THIS BOT!**  
#### it is **EXPRESSLY** against `Discord`'s ToS to obtain your user `TOKEN`, and I am not responsible in any way for any actions which `Discord` may take at any time now or in the future regarding anyone's use of this code.  
### <sub>and one more time for the people in the back</sub> **I AM NOT RESPONSIBLE FOR ANY DAMAGE THIS CODE MAY CAUSE!**  

## `LICENSE`  
This code is built mainly using `discord.js-selfbot-v13`, which is licensed GNU GPLv3.  
For that reason, this project holds the same license -- though it is not (yet) present in the repository.  
I will add it when I get around to it.  

---

## What?
`go-offline-dms` is intended as a **Limiter**: it keeps track of how many messages (currently just DMs) you send, and if you exceed a certain limit, it will stop you from sending any more messages.

## Why?  
I can't stop using `Discord`. It is a problem. I have a problem. This is for me. Feel free to use it ***AT YOUR OWN RISK***, but ***CRUCIALLY*** I am NOT responsible for any damage it may cause.

## How?  
I have no idea.  
AI pretty much writes this stuff these days.  
I just tell it to do stuff.  

---

<div align="center">

![Execution when messaging a recipient -- display profile picture](https://i.imgur.com/Fyx96ah.png)  
</div>


> <i>It took so long. & it doesn't even do what I meant it to do -- it can't elevate out of Windows permissions & nuke the `Discord` process yet. </i>  
  
---

## `FEATURES`  
- [x] Offers limiting functionality based on **both** `time spent messaging` and `message amount` sent during `time period`.  
- [x] Offers a `cooldown` period after the limit is reached, during which the Bot will reprimand you for your actions, or retaliate depending on if you have `strict` mode enabled in `config.json`.  
- [x] Offers a `strict` mode, which will **delete** your messages if you exceed the limit 
    > Good idea Copilot! I'll do that!  
    > [@zudsniper](https://github.com/zudsniper)  
  
### Stupid Features
<sup><i>That, of course, took fucking FOREVER to implement. </i></sup>
- [x] Really overkill `winston` logging that I will probably integration into [`@zudsniper/typescriptApp`](https://github.com/zudsniper/typescriptApp).  
- [x] Terrible design decision to keep everything in exactly the same file -- glorious `index.ts`...  

### _REALLY_ Stupid Features
- [x] When any message is sent, the recipient's profile picture is ***PARSED & INTERPRETED INTO AN `ANSI` Colored GRID OF SPECIFIED DIMENSIONS FOR CLI PRETTINESS***  
    > I have so much shit I should be doing man...  
- [x] Hit that `figlet.js` grindset and got a nice-lookin' startup text message

<hr>

<i><code>zod.tf</code></i>

[![Discord](https://img.shields.io/discord/974855479975100487?label=tf2%20discord)](https://discord.gg/zodtf)  ![GitHub issue custom search](https://img.shields.io/github/issues-search?color=114444&label=issues&query=involves%3Azudsniper)  ![GitHub followers](https://img.shields.io/github/followers/zudsniper?style=social)

> _fullstack development, server administration, web design, branding creation, musical composition & performance, video editing, and more probably_

<a href="https://zod.tf/"><img src="https://user-images.githubusercontent.com/16076573/222953031-03f44756-03bf-46b9-b66e-98d50dc013fc.png" alt="second zod.tf logo" width="150rem" style="max-width: 100%;"></a>