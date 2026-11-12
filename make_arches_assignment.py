"""Arches assignment (ARC 2202) - A3 sheet, scale 1:20, model units = cm.

Q1 Semicircular arch : S = 200 cm, R = S/2
Q2 Segmental arch    : S = 180 cm, h (rise) = 50 cm, R = (S^2/4 + h^2) / 2h
Q3 Straight arch     : S = 140 cm, skewback angle 60 deg (equilateral triangle),
                       h = S/2 * tan 60 (height of striking point below springing)

Title-block text comes from environment variables so no personal data is stored here:
STUDENT_NAME, STUDENT_ID, SUBJECT, ASSIGNMENT, SHEET_DATE, OUT_DIR
"""
import math, os, ezdxf
from ezdxf.math import Vec2
from ezdxf.enums import TextEntityAlignment as TA

E = lambda k, d="": os.environ.get(k, d)
OUT = E("OUT_DIR", os.path.dirname(os.path.abspath(__file__)))

SCALE = 20           # 1:20
JAMB = 150.0         # window height to springing line (cm)
DEPTH = 23.0         # arch depth = one brick length (cm)
PAD = 25.0           # brickwork each side of the opening (cm)
WALL_H = 300.0       # wall height (cm)
GAP = 45.0           # gap between the three walls (cm)

doc = ezdxf.new("R2010", setup=True)
doc.units = 5        # centimetres
doc.header["$MEASUREMENT"] = 1
doc.header["$LTSCALE"] = 1
doc.header["$PSLTSCALE"] = 1
for name, col, lt in [("WALL", 7, "CONTINUOUS"), ("ARCH", 1, "CONTINUOUS"), ("BRICK", 8, "CONTINUOUS"),
                      ("CENTER", 3, "DASHED"), ("TEXT", 2, "CONTINUOUS"), ("DIM", 4, "CONTINUOUS"),
                      ("FRAME", 7, "CONTINUOUS")]:
    doc.layers.add(name, color=col, linetype=lt)
msp = doc.modelspace()

pt = lambda c, ang, r: Vec2(c) + Vec2.from_deg_angle(ang, r)
def line(a, b, lay="ARCH"):
    msp.add_line(a, b, dxfattribs={"layer": lay})
def text(s, p, h=7.0, align=TA.MIDDLE_CENTER):
    msp.add_text(s, height=h, dxfattribs={"layer": "TEXT"}).set_placement(p, align=align)

k = SCALE / 10.0     # paper mm -> model cm
DIM = {"dimtxt": 2.5 * k, "dimasz": 2.0 * k, "dimexe": 1.5 * k, "dimexo": 1.0 * k,
       "dimgap": 0.8 * k, "dimdec": 2, "dimzin": 8, "dimlfac": 1.0, "dimdsep": ord(".")}
def hdim(p1, p2, y):
    msp.add_linear_dim(base=(p1[0], y), p1=p1, p2=p2, dxfattribs={"layer": "DIM"}, override=DIM).render()
def vdim(p1, p2, x):
    msp.add_linear_dim(base=(x, p1[1]), p1=p1, p2=p2, angle=90, dxfattribs={"layer": "DIM"}, override=DIM).render()
def adim(p1, p2, dist):
    msp.add_aligned_dim(p1=p1, p2=p2, distance=dist, dxfattribs={"layer": "DIM"}, override=DIM).render()


def wall(x0, S, outline, title, info):
    """Brick wall around an opening at x0..x0+S. outline: (x,y,bulge) from left springing over the arch to right springing."""
    pts = [(x0 - PAD, 0, 0), (x0, 0, 0)] + outline + [(x0 + S, 0, 0), (x0 + S + PAD, 0, 0),
                                                      (x0 + S + PAD, WALL_H, 0), (x0 - PAD, WALL_H, 0)]
    msp.add_lwpolyline(pts, format="xyb", close=True, dxfattribs={"layer": "WALL"})
    h = msp.add_hatch(color=256, dxfattribs={"layer": "BRICK"})
    h.set_pattern_fill("AR-BRSTD", scale=0.1)          # ~23 x 7 cm bricks
    h.paths.add_polyline_path(pts, is_closed=True)
    line((x0 - PAD - 5, 0), (x0 + S + PAD + 5, 0), "WALL")
    hdim((x0 - PAD, 0), (x0, 0), -10)
    hdim((x0, 0), (x0 + S, 0), -10)
    hdim((x0 + S, 0), (x0 + S + PAD, 0), -10)
    hdim((x0 - PAD, WALL_H), (x0 + S + PAD, WALL_H), WALL_H + 10)
    vdim((x0 + S + PAD, 0), (x0 + S + PAD, WALL_H), x0 + S + PAD + 10)
    vdim((x0, 0), (x0, JAMB), x0 + 10)                 # window height, inside the opening
    text(title, (x0 + S / 2, -32), 9.0)
    for i, s in enumerate(info):
        text(s, (x0 + S / 2, -46 - i * 11), 6.0)


def voussoirs(c, r, a1, a2, n):
    for i in range(n + 1):
        a = a1 + (a2 - a1) * i / n
        line(pt(c, a, r), pt(c, a, r + DEPTH))


# ---------------- Q1 Semicircular arch ----------------
S1 = 200.0
R1 = S1 / 2
x0 = PAD
c = Vec2(x0 + S1 / 2, JAMB)
msp.add_arc(c, R1, 0, 180, dxfattribs={"layer": "ARCH"})
msp.add_arc(c, R1 + DEPTH, 0, 180, dxfattribs={"layer": "ARCH"})
voussoirs(c, R1, 0, 180, 31)
line((x0, JAMB), (x0 + S1, JAMB), "CENTER")
line(c, pt(c, 135, R1), "CENTER")
text(f"R={R1:g}", pt(c, 135, R1 * 0.55) + Vec2(-4, 6), 6.0)
adim(pt(c, 0, R1), pt(c, 0, R1 + DEPTH), -8)
wall(x0, S1, [(x0, JAMB, 0), (x0 - DEPTH, JAMB, -1.0), (x0 + S1 + DEPTH, JAMB, 0), (x0 + S1, JAMB, 0)],
     "Q.1  SEMICIRCULAR ARCH", [f"S = {S1:g} cm    R = S/2 = {R1:g} cm", "SCALE 1:20"])

# ---------------- Q2 Segmental arch ----------------
S2, H2 = 180.0, 50.0
R2 = (S2 * S2 / 4 + H2 * H2) / (2 * H2)
x0 = PAD + S1 + PAD + GAP + PAD
c = Vec2(x0 + S2 / 2, JAMB + H2 - R2)
th = math.degrees(math.asin((S2 / 2) / R2))
a1, a2 = 90 - th, 90 + th
msp.add_arc(c, R2, a1, a2, dxfattribs={"layer": "ARCH"})
msp.add_arc(c, R2 + DEPTH, a1, a2, dxfattribs={"layer": "ARCH"})
voussoirs(c, R2, a1, a2, 21)
line(c, (x0, JAMB), "CENTER"); line(c, (x0 + S2, JAMB), "CENTER")
line((x0, JAMB), (x0 + S2, JAMB), "CENTER")
line((x0 + S2 / 2, JAMB), (x0 + S2 / 2, JAMB + H2), "CENTER")
vdim((x0 + S2 / 2, JAMB), (x0 + S2 / 2, JAMB + H2), x0 + S2 / 2 + 8)
text(f"R={R2:g}", pt(c, a1, R2 * 0.5) + Vec2(14, 0), 6.0)
text("O", Vec2(c) + Vec2(0, -7), 6.0)
ol, orr = pt(c, a2, R2 + DEPTH), pt(c, a1, R2 + DEPTH)
wall(x0, S2, [(x0, JAMB, 0), (ol.x, ol.y, -math.tan(math.radians(2 * th) / 4)), (orr.x, orr.y, 0), (x0 + S2, JAMB, 0)],
     "Q.2  SEGMENTAL ARCH",
     [f"S = {S2:g} cm    h = {H2:g} cm", f"R = (S²/4 + h²) / 2h = {R2:g} cm", "SCALE 1:20"])

# ---------------- Q3 Straight (flat) arch ----------------
S3, ANG = 140.0, 60.0
H3 = S3 / 2 * math.tan(math.radians(ANG))
x0 = x0 + S2 + PAD + GAP + PAD
c = Vec2(x0 + S3 / 2, JAMB - H3)
rt = (H3 + DEPTH) / math.sin(math.radians(ANG))
tl, tr = pt(c, 180 - ANG, rt), pt(c, ANG, rt)
line((x0, JAMB), (x0 + S3, JAMB)); line(tl, tr)
n = 15
for i in range(n + 1):
    a = ANG + (180 - 2 * ANG) * i / n
    s = math.sin(math.radians(a))
    line(pt(c, a, H3 / s), pt(c, a, (H3 + DEPTH) / s))
line(c, (x0, JAMB), "CENTER"); line(c, (x0 + S3, JAMB), "CENTER")
line(c, (x0 + S3 / 2, JAMB), "CENTER")
text("O", Vec2(c) + Vec2(0, -7), 6.0)
vdim((x0 + S3 / 2, c.y), (x0 + S3 / 2, JAMB), x0 + S3 / 2 + 10)
vdim((tl.x, JAMB), (tl.x, tl.y), tl.x - 8)
text(f"{ANG:g}°", (x0 + 14, JAMB - 9), 6.0)
wall(x0, S3, [(x0, JAMB, 0), (tl.x, tl.y, 0), (tr.x, tr.y, 0), (x0 + S3, JAMB, 0)],
     "Q.3  STRAIGHT ARCH",
     [f"S = {S3:g} cm    angle = {ANG:g}°", f"h = S/2 × tan60 = {H3:.2f} cm", "SCALE 1:20"])
x_end = x0 + S3 + PAD

# ---------------- A3 sheet: 10 mm border, 2 x 10 mm title block ----------------
lay = doc.layouts.new("A3"); doc.layouts.delete("Layout1")
lay.page_setup(size=(420, 297), margins=(0, 0, 0, 0), units="mm")
F = {"layer": "FRAME"}
lay.add_lwpolyline([(10, 10), (410, 10), (410, 287), (10, 287)], close=True, dxfattribs={**F, "const_width": 0.5})
lay.add_line((10, 30), (410, 30), dxfattribs=F)
lay.add_line((10, 20), (410, 20), dxfattribs=F)
for x in (41, 143, 174, 274, 304):
    lay.add_line((x, 10), (x, 30), dxfattribs=F)
xs = [10, 41, 143, 174, 274, 304]
rows = [(25, ["Name", E("STUDENT_NAME"), "Subject", E("SUBJECT"), "Date", E("SHEET_DATE")]),
        (15, ["ID", E("STUDENT_ID"), "Assignment", E("ASSIGNMENT"), "Scale", "1:20"])]
for y, cells in rows:
    for s, x in zip(cells, xs):
        if s:
            lay.add_text(s, height=3.5, dxfattribs={"layer": "TEXT"}).set_placement((x + 2.5, y), align=TA.MIDDLE_LEFT)
# viewport: 396 x 253 mm drawing area, model shown at 1:20 (1 cm model = 0.5 mm paper)
vp_h = 253.0
lay.add_viewport(center=(210, 158.5), size=(396, vp_h), view_center_point=(x_end / 2, 130),
                 view_height=vp_h * SCALE / 10.0)

doc.saveas(os.path.join(OUT, "arches_assignment_A3.dxf"))
from ezdxf.addons.drawing import matplotlib as dm
dm.qsave(lay, os.path.join(OUT, "arches_assignment_A3_preview.png"), bg="#FFFFFF", dpi=150)
print("R2 =", R2, " h3 =", round(H3, 2), " model width =", x_end)
