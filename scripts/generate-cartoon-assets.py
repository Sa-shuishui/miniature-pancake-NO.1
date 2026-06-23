from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "miniprogram" / "assets"
AVATARS = ASSET_ROOT / "avatars"
ILLUSTRATIONS = ASSET_ROOT / "illustrations"
AVATARS.mkdir(parents=True, exist_ok=True)
ILLUSTRATIONS.mkdir(parents=True, exist_ok=True)


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def heart(draw, cx, cy, size, fill):
    s = size
    draw.ellipse((cx - s, cy - s, cx, cy), fill=fill)
    draw.ellipse((cx, cy - s, cx + s, cy), fill=fill)
    draw.polygon([(cx - s, cy - s / 3), (cx + s, cy - s / 3), (cx, cy + s * 1.35)], fill=fill)


def face(draw, cx, cy, male=True, scale=1):
    skin = "#ffd8bd"
    hair = "#4f382d" if male else "#7a4b54"
    r = int(42 * scale)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=skin, outline="#d99b83", width=max(2, int(3 * scale)))
    if male:
        draw.pieslice((cx - r - 8, cy - r - 14, cx + r + 8, cy + 6), 180, 360, fill=hair)
        draw.rectangle((cx - r + 2, cy - r + 14, cx + r - 4, cy - 8), fill=hair)
    else:
        draw.pieslice((cx - r - 18, cy - r - 22, cx + r + 18, cy + r + 18), 180, 360, fill=hair)
        draw.ellipse((cx - r - 28, cy - 2, cx - r + 12, cy + r + 44), fill=hair)
        draw.ellipse((cx + r - 12, cy - 2, cx + r + 28, cy + r + 44), fill=hair)
        heart(draw, cx + r - 6, cy - r + 8, int(7 * scale), "#ff8fa8")
    eye = int(5 * scale)
    draw.ellipse((cx - 18 * scale, cy - 4 * scale, cx - 18 * scale + eye, cy - 4 * scale + eye), fill="#3b2d29")
    draw.ellipse((cx + 14 * scale, cy - 4 * scale, cx + 14 * scale + eye, cy - 4 * scale + eye), fill="#3b2d29")
    draw.arc((cx - 15 * scale, cy + 10 * scale, cx + 18 * scale, cy + 28 * scale), 10, 170, fill="#b05d62", width=max(2, int(3 * scale)))


def avatar(path, gender, role):
    male = gender == "male"
    approver = role == "approver"
    bg = "#edf8ff" if male else "#fff1f5"
    shirt = "#7fb9e7" if male else "#f59fba"
    accent = "#8ec88f" if approver else "#f4c25f"
    img = Image.new("RGBA", (520, 460), bg)
    d = ImageDraw.Draw(img)

    for x, y, color in [(78, 84, "#cfe9ff"), (420, 96, "#ffd8e2"), (120, 340, "#ffe8ba")]:
        heart(d, x, y, 12, color)
    d.ellipse((112, 160, 408, 362), fill="#ffffff88")
    face(d, 260, 155, male=male, scale=1.15)
    rounded_rect(d, (162, 228, 358, 388), 62, shirt, None, 1)

    if approver:
        rounded_rect(d, (292, 248, 410, 344), 26, "#fff2c6", "#e5b854", 5)
        d.ellipse((324, 210, 378, 264), fill=accent)
        d.line((351, 264, 351, 304), fill="#6ba878", width=7)
        rounded_rect(d, (104, 270, 208, 346), 20, "#fff7fb", "#ee9eb5", 4)
        d.line((124, 304, 186, 304), fill="#aa6375", width=5)
    else:
        rounded_rect(d, (298, 258, 420, 346), 22, "#ffffff", "#dfbca9", 5)
        d.line((322, 292, 394, 292), fill="#8d756f", width=5)
        d.line((322, 318, 378, 318), fill="#8d756f", width=5)
        rounded_rect(d, (88, 260, 210, 352), 22, "#fff2c6", "#e5b854", 5)
        d.ellipse((124, 230, 174, 280), fill=accent)

    img.save(AVATARS / path)


def shared_flower():
    img = Image.new("RGBA", (560, 430), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rounded_rect(d, (104, 202, 456, 370), 58, "#fffaf2", "#eec9b8", 6)
    face(d, 178, 148, male=True, scale=.82)
    face(d, 382, 148, male=False, scale=.82)
    d.line((280, 150, 280, 254), fill="#77ae70", width=9)
    d.ellipse((214, 210, 278, 250), fill="#8cc77d")
    d.ellipse((282, 208, 348, 248), fill="#8cc77d")
    heart(d, 280, 132, 34, "#ff7580")
    d.arc((180, 236, 380, 330), 15, 165, fill="#b87972", width=6)
    img.save(AVATARS / "shared-flower.png")


def hero_garden():
    img = Image.new("RGBA", (900, 760), "#fff9ef")
    d = ImageDraw.Draw(img)
    d.rectangle((0, 540, 900, 760), fill="#f6d6a5")
    for x in range(20, 900, 82):
        d.ellipse((x, 690, x + 36, 728), fill="#9fc878")
        heart(d, x + 44, 680, 12, "#ff94a2")

    d.rounded_rectangle((338, 396, 562, 612), radius=54, fill="#f5bd56", outline="#ca8f35", width=7)
    d.ellipse((348, 384, 552, 452), fill="#ffd177", outline="#ca8f35", width=6)
    d.rounded_rectangle((404, 486, 496, 568), radius=24, fill="#ffe5a6", outline="#c59042", width=5)
    d.line((450, 270, 450, 430), fill="#75ac69", width=11)
    d.ellipse((354, 330, 448, 388), fill="#8ec97b")
    d.ellipse((452, 320, 550, 384), fill="#8ec97b")
    heart(d, 450, 246, 43, "#ff747f")

    face(d, 245, 246, male=True, scale=1.25)
    d.rounded_rectangle((96, 330, 352, 610), radius=82, fill="#8bbce8")
    d.polygon([(284, 418), (370, 448), (348, 488), (260, 456)], fill="#95b8d8", outline="#6587a6")
    d.line((332, 464, 404, 498), fill="#7ab8df", width=6)
    d.line((346, 474, 418, 506), fill="#7ab8df", width=5)

    face(d, 650, 244, male=False, scale=1.25)
    d.rounded_rectangle((554, 328, 810, 608), radius=82, fill="#f6a1b8")
    d.rounded_rectangle((552, 404, 638, 494), radius=24, fill="#ffbbc9", outline="#c87585", width=5)
    d.line((552, 428, 508, 486), fill="#c87585", width=5)

    for x, y in [(124, 124), (744, 126), (688, 310), (306, 324), (588, 214)]:
        heart(d, x, y, 14, "#ffadb7")
    img.save(ILLUSTRATIONS / "hero-garden.png")


def meadow():
    img = Image.new("RGBA", (900, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((-90, 70, 990, 330), fill="#cbe5b1")
    for x in range(20, 900, 64):
        d.line((x, 160, x + 12, 88), fill="#7dac6a", width=4)
        d.ellipse((x - 18, 86, x + 16, 120), fill="#ffe38b")
        d.ellipse((x + 2, 78, x + 36, 112), fill="#ffd0d8")
        d.ellipse((x + 8, 110, x + 42, 144), fill="#fff4a9")
    img.save(ILLUSTRATIONS / "bottom-meadow.png")


for gender in ("male", "female"):
    for role in ("applicant", "approver"):
        avatar(f"{gender}-{role}.png", gender, role)

shared_flower()
hero_garden()
meadow()
print(f"generated assets in {ASSET_ROOT}")
