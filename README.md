# Knob.jquery.js

Easily draw & animate segments of a circle, using HTML5 Canvas. 

[Example](example)

[example][data:image/png;base64,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]