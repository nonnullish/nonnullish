---
title: Resetting the timer in my toothbrush 
description: It’s still good to use, I swear
date: 2023-12-19T16:12:00+01:00
comments: true
tags: tech
---
There is an NFC chip inside of my toothbrush head, and it counts the time. After 360 minutes of work it will signal that it needs to be replaced, even if it doesn’t really. It’s possible to reset the counter, by sending a message from a phone to the toothbrush head. [It’s all a little insane](https://kuenzi.dev/toothbrush/).

<figure>
  <img src="doom.png" alt="Flipper Zero with Doom and a Sonicare toothbrush head" />
  <figcaption><i><a href="https://mastodon.social/@MissInformation@chaos.social/111907173465719782">(source)</a></i></figcaption>
</figure>

1. Scan the Philips Sonicare toothbrush head with the NFC Tools app ([iOS](https://apps.apple.com/pl/app/nfc-tools/id1252962749) / [Android](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)). Copy the serial number.
2. Find the part number written on the bottom of the brush head.
3. Enter the data [into the password generator](https://nicjes.github.io/SonicareGenerator/) and copy the generated NFC command.
4. In NFC Tools, go to Other → Advanced NFC Commands. Paste the command into the input and send it to the toothbrush head. 