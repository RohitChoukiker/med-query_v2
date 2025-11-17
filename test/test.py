
import pytesseract
from PIL import Image

# Mac path
pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"

img = Image.open("/Users/rohitchoukiker/Downloads/Rohit_Choukiker_certificate.png")
text = pytesseract.image_to_string(img)

print(text)
