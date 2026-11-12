import math, ezdxf
from ezdxf.math import Vec2

K = 1/20  # drawing size factor (1/20 -> small drawing, real mm on paper)
S, H, D = 1000.0*K, 1200.0*K, 230.0*K      # span, jamb height, arch depth (mm)
WALL_H, WALL_PAD = 2200.0*K, 500.0*K
doc = ezdxf.new("R2010", setup=True)
doc.units = 4
doc.header["$MEASUREMENT"] = 1
doc.header["$LTSCALE"] = 1
for name, col, lt in [("WALL",7,"CONTINUOUS"),("ARCH",1,"CONTINUOUS"),("BRICK",8,"CONTINUOUS"),
                      ("CENTER",3,"DASHED"),("TEXT",2,"CONTINUOUS"),("DIM",4,"CONTINUOUS"),("FRAME",7,"CONTINUOUS")]:
    doc.layers.add(name, color=col, linetype=lt)
msp = doc.modelspace()
L = lambda a,b,lay="ARCH": msp.add_line(a,b,dxfattribs={"layer":lay})
P = lambda c,ang,r: Vec2(c)+Vec2.from_deg_angle(ang,r)
dimov = {"dimtxt":2.5,"dimasz":2,"dimexe":1.5,"dimexo":1,"dimgap":0.8,"dimdec":2,"dimdsep":ord("."),"dimzin":8,"dimlfac":1.0}

def wall(x0, outline, title):
    # outline: list of (x,y,bulge) from (0,1200) over arch to (1000,1200), local coords
    pts = [(-WALL_PAD,0,0),(0,0,0)] + outline + [(S,0,0),(S+WALL_PAD,0,0),(S+WALL_PAD,WALL_H,0),(-WALL_PAD,WALL_H,0)]
    pts = [(x+x0,y,b) for x,y,b in pts]
    msp.add_lwpolyline(pts, format="xyb", close=True, dxfattribs={"layer":"WALL"})
    h = msp.add_hatch(color=256, dxfattribs={"layer":"BRICK"})
    h.set_pattern_fill("AR-BRSTD", scale=K)
    h.paths.add_polyline_path(pts, is_closed=True)
    msp.add_line((x0-WALL_PAD-10,0),(x0+S+WALL_PAD+10,0),dxfattribs={"layer":"WALL"})
    msp.add_text(title, height=4, dxfattribs={"layer":"TEXT"}).set_placement((x0+S/2,-26), align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER)
    d = msp.add_linear_dim(base=(x0,-10), p1=(x0,0), p2=(x0+S,0), dxfattribs={"layer":"DIM"}, override=dimov); d.render()
    for a,b in [((x0-WALL_PAD,0),(x0,0)),((x0+S,0),(x0+S+WALL_PAD,0))]:
        msp.add_linear_dim(base=(x0,-10), p1=a, p2=b, dxfattribs={"layer":"DIM"}, override=dimov).render()
    msp.add_linear_dim(base=(x0,WALL_H+8), p1=(x0-WALL_PAD,WALL_H), p2=(x0+S+WALL_PAD,WALL_H), dxfattribs={"layer":"DIM"}, override=dimov).render()
    msp.add_linear_dim(base=(x0-WALL_PAD-8,0), p1=(x0-WALL_PAD,0), p2=(x0-WALL_PAD,WALL_H), angle=90, dxfattribs={"layer":"DIM"}, override=dimov).render()
    d = msp.add_linear_dim(base=(x0+S+WALL_PAD+8,0), p1=(x0+S,0), p2=(x0+S,H), angle=90, dxfattribs={"layer":"DIM"}, override=dimov); d.render()

# ---- Flat arch ----
x0 = 0.0
hb = S/2*math.sqrt(3); C = Vec2(x0+S/2, H-hb); r_top = (hb+D)/math.sin(math.radians(60))
tl, tr = P(C,120,r_top), P(C,60,r_top)
L((x0,H),(x0+S,H)); L(tl,tr)
n = 11
for i in range(n+1):
    a = 60 + 60*i/n
    L(P(C,a,hb/math.sin(math.radians(a))), P(C,a,(hb+D)/math.sin(math.radians(a))))
L(C,(x0,H),"CENTER"); L(C,(x0+S,H),"CENTER")
msp.add_text("C", height=2.5, dxfattribs={"layer":"TEXT"}).set_placement((C.x+2,C.y-4))
msp.add_linear_dim(base=(tl.x-6,0), p1=(x0,H), p2=(x0,tl.y), angle=90, dxfattribs={"layer":"DIM"}, override=dimov).render()
msp.add_linear_dim(base=(x0,tl.y+5), p1=tl, p2=tr, dxfattribs={"layer":"DIM"}, override=dimov).render()
wall(x0, [(0,H,0),(tl.x-x0,tl.y,0),(tr.x-x0,tr.y,0),(S,H,0)], "FLAT ARCH")

# ---- Semi-circular arch ----
x0 = 2500.0*K*1.0+15
C = Vec2(x0+S/2, H); r = S/2
msp.add_arc(C, r, 0, 180, dxfattribs={"layer":"ARCH"}); msp.add_arc(C, r+D, 0, 180, dxfattribs={"layer":"ARCH"})
n = 21
for i in range(n+1):
    a = 180*i/n; L(P(C,a,r),P(C,a,r+D))
L((x0,H),(x0+S,H),"CENTER")
msp.add_text(f"R={r:.2f}  R={r+D:.2f}", height=2.5, dxfattribs={"layer":"TEXT"}).set_placement((C.x-12,C.y-6))
msp.add_aligned_dim(p1=P(C,0,r), p2=P(C,0,r+D), distance=-4, dxfattribs={"layer":"DIM"}, override=dimov).render()
wall(x0, [(0,H,0),(-D,H,-1.0),(S+D,H,0),(S,H,0)], "SEMI-CIRCULAR ARCH")

# ---- Segmental arch ----
x0 = 5000.0*K+30
rise = S/6; R = (S*S/4 + rise*rise)/(2*rise)
C = Vec2(x0+S/2, H+rise-R); th = math.degrees(math.asin((S/2)/R)); a1, a2 = 90-th, 90+th
msp.add_arc(C, R, a1, a2, dxfattribs={"layer":"ARCH"}); msp.add_arc(C, R+D, a1, a2, dxfattribs={"layer":"ARCH"})
n = 15
for i in range(n+1):
    a = a1+(a2-a1)*i/n; L(P(C,a,R),P(C,a,R+D))
L(C,(x0,H),"CENTER"); L(C,(x0+S,H),"CENTER"); L((x0,H),(x0+S,H),"CENTER"); L((x0+S/2,H),(x0+S/2,H+rise),"CENTER")
ol, orr = P(C,a2,R+D), P(C,a1,R+D)
b = -math.tan(math.radians(2*th)/4)
wall(x0, [(0,H,0),(ol.x-x0,ol.y,b),(orr.x-x0,orr.y,0),(S,H,0)], "SEGMENTAL ARCH")
d = msp.add_linear_dim(base=(x0+S/2+7,H), p1=(x0+S/2,H), p2=(x0+S/2,H+rise), angle=90, dxfattribs={"layer":"DIM"}, override=dimov); d.render()
msp.add_text(f"R={R:.2f}  R={R+D:.2f}", height=2.5, dxfattribs={"layer":"TEXT"}).set_placement((x0+S/2+3,H-12))

# ---- A3 layout at 1:20 ----
lay = doc.layouts.new("A3"); doc.layouts.delete("Layout1")
lay.page_setup(size=(420,297), margins=(0,0,0,0), units="mm")
lay.add_lwpolyline([(10,10),(410,10),(410,287),(10,287)], close=True, dxfattribs={"layer":"FRAME","const_width":0.5})
lay.add_lwpolyline([(10,10),(410,10),(410,35),(10,35)], close=True, dxfattribs={"layer":"FRAME"})
lay.add_viewport(center=(210,155), size=(390,230), view_center_point=(162,45), view_height=230)
lay.add_text("TYPES OF ARCHES ON GEOMETRY", height=6, dxfattribs={"layer":"TEXT"}).set_placement((20,20))
lay.add_text("UNITS: mm", height=4, dxfattribs={"layer":"TEXT"}).set_placement((300,20))
doc.saveas("/home/user/DeepFlow/arches_small_mm.dxf")

from ezdxf.addons.drawing import matplotlib as dm
dm.qsave(lay, "/home/user/DeepFlow/arches_small_mm_preview.png", bg="#FFFFFF", dpi=150)
print("ok")
