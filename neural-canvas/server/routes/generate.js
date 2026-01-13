const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { prompt, style } = req.body;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${prompt}, ${style} style`,
      size: "1024x1024"
    });

    res.json({
      image: result.data[0].b64_json
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

module.exports = router;
