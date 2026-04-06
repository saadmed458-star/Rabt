import axios from "axios"

export default {
  name: "welcome",
  event: "group-participants.update",

  async execute({ sock, update }) {

    const { id, participants, action } = update

    if (action !== "add") return

    for (const user of participants) {

      let pp
      try {
        pp = await sock.profilePictureUrl(user, "image")
      } catch {
        pp = "https://i.imgur.com/6Z6FQpM.png"
      }

      const text = `
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
❒ *╭┈⊰* 🌷الــتــرحــيــب🌷 *⊰┈ ✦*
*┊˹📯˼┊ اهــلا بـك/ي*
┊˹🥷🏻˼┊ @${user.split("@")[0]}
┊📩 *اقرأ وصف المجموعة*

> *منور الجروب ┊˹✅˼┊*
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
>  𝐇 𝐈 𝐋 𝐃 𝐄 - 𝑩𝛩𝑻 ⚜️
`

      await sock.sendMessage(id, {
        image: { url: pp },
        caption: text,
        mentions: [user]
      })

    }

  }
}