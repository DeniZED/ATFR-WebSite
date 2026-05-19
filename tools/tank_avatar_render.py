"""
ATFR Tank Avatar Generator — Blender 3.x / 4.x
══════════════════════════════════════════════════════════════════════════════
USAGE

  GUI  : Blender → Scripting tab → Nouveau → Coller → Exécuter le script
         (F12 pour prévisualiser une skin avant le batch)

  CLI  : blender --background --python tools/tank_avatar_render.py

OUTPUT : ~/tank_renders/tank-default-<skin>.png  (512 × 380 px, RGBA)

Ensuite copier dans : public/images/tank_avatars/

RÉGLAGES RAPIDES
  SAMPLES     64 → 256 pour qualité finale (plus long)
  ORTHO_SCALE ↓ = zoom avant   ↑ = zoom arrière
  PREVIEW_SKIN « default » — seule skin rendue en mode GUI (plus rapide)
══════════════════════════════════════════════════════════════════════════════
"""

import bpy
import math
import os
from mathutils import Vector

# ─── Réglages ────────────────────────────────────────────────────────────────
OUTPUT_DIR   = os.path.join(os.path.expanduser("~"), "tank_renders")
RENDER_W     = 512
RENDER_H     = 380
SAMPLES      = 96       # 256+ pour qualité finale
ORTHO_SCALE  = 1.85     # zoom caméra ortho
S            = 0.12     # unité iso → mètre Blender
PREVIEW_SKIN = None     # None = toutes les skins, « default » = une seule

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── Palette de couleurs ──────────────────────────────────────────────────────
def s2l(r, g, b):
    """sRGB 8-bit → linéaire float."""
    return tuple((v / 255) ** 2.2 for v in (r, g, b))

SKINS = {
    'default':  dict(base=s2l( 78,120, 40), track=s2l(28,28,28),  acc=None,              metal=0.00, rough=0.72),
    'desert':   dict(base=s2l(176,136, 40), track=s2l(32,26,16),  acc=None,              metal=0.00, rough=0.75),
    'winter':   dict(base=s2l(156,188,208), track=s2l(34,48,62),  acc=None,              metal=0.00, rough=0.58),
    'urban':    dict(base=s2l( 88, 96,104), track=s2l(28,30,32),  acc=None,              metal=0.00, rough=0.78),
    'forest':   dict(base=s2l( 38, 72, 22), track=s2l(16,20,16),  acc=None,              metal=0.00, rough=0.82),
    'digital':  dict(base=s2l( 60, 92, 50), track=s2l(24,28,20),  acc=None,              metal=0.00, rough=0.75),
    'arctic':   dict(base=s2l(184,220,240), track=s2l(30,44,60),  acc=None,              metal=0.00, rough=0.55),
    'atfr':     dict(base=s2l( 26, 42, 58), track=s2l( 8,16,26),  acc=s2l(201,162, 39),  metal=0.10, rough=0.52),
    'chrome':   dict(base=s2l(144,172,190), track=s2l(38,38,38),  acc=s2l(208,232,244),  metal=0.92, rough=0.16),
    'prestige': dict(base=s2l( 36, 36, 36), track=s2l(10,10,10),  acc=s2l(201,162, 39),  metal=0.20, rough=0.28),
}

GUN_COL = s2l(18, 18, 18)

# ─── Dimensions (mêmes unités que le SVG) ────────────────────────────────────
HX, HY, HZ = -4.0, -3.5, 0.0
HW, HD, HH  =  8.0,  7.0, 2.8
TW, TE      =  2.0,  0.5
TX           = HX - TE
TDX          = HW + TE * 2
NTY          = HY - TW
FTY          = HY + HD
UW, UD, UH  = 5.2, 4.4, 2.3
UX = HX + (HW - UW) / 2 - 0.4
UY = HY + (HD - UD) / 2 - 0.3
UZ = HZ + HH
GW, GD, GH  = 6.6, 0.8, 0.8
GX = UX + UW
GY = UY + (UD - GD) / 2
GZ = UZ + (UH - GH) / 2
MBW, MBD, MBH = 0.65, 1.22, 1.22
MBX = GX + GW
MBY = GY - (MBD - GD) / 2
MBZ = GZ - (MBH - GH) / 2

WHEEL_X_POSITIONS = [-3.6, -1.8, 0.0, 1.8, 3.6]

# ─── Helpers géométrie ────────────────────────────────────────────────────────
def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)


def box(name, cx, cy, cz, w, d, h, bevel=0.0):
    """Boîte centrée aux coordonnées iso, bevel optionnel."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx * S, cy * S, cz * S))
    o = bpy.context.active_object
    o.name = name
    o.scale = (w * S, d * S, h * S)
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        m = o.modifiers.new("Bvl", 'BEVEL')
        m.width    = bevel * S
        m.segments = 3
        m.profile  = 0.6
    return o


def cyl(name, cx, cy, cz, r, h, verts=16, axis='Z'):
    """Cylindre centré, orientable selon X, Y ou Z."""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=r * S, depth=h * S, vertices=verts,
        location=(cx * S, cy * S, cz * S),
    )
    o = bpy.context.active_object
    o.name = name
    if axis == 'Y':
        o.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
    elif axis == 'X':
        o.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(rotation=True)
    return o


def make_mat(name, col, metal=0.0, rough=0.65):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1.0)
    b.inputs["Metallic"].default_value   = metal
    b.inputs["Roughness"].default_value  = rough
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


# ─── Construction du char ─────────────────────────────────────────────────────
def build_tank():
    p = {}

    # Chenilles (rectangulaires — correct pour les tanks)
    p['far_track']  = box("FarTrack",  TX + TDX/2, FTY + TW/2, HH/2, TDX, TW, HH)
    p['near_track'] = box("NearTrack", TX + TDX/2, NTY + TW/2, HH/2, TDX, TW, HH)

    # Caisse + tourelle (bevel = bords légèrement arrondis)
    p['hull']   = box("Hull",   HX+HW/2, HY+HD/2, HZ+HH/2, HW, HD, HH, bevel=0.14)
    p['turret'] = box("Turret", UX+UW/2, UY+UD/2, UZ+UH/2, UW, UD, UH, bevel=0.20)

    # Coupole (trappe commandant)
    p['cupola'] = cyl("Cupola", UX+1.8, UY+1.8, UZ+UH+0.38, 0.88, 0.78, verts=16)

    # Canon + frein de bouche
    p['gun']    = box("Gun",    GX+GW/2,   GY+GD/2,   GZ+GH/2,   GW,  GD,  GH)
    p['muzzle'] = box("Muzzle", MBX+MBW/2, MBY+MBD/2, MBZ+MBH/2, MBW, MBD, MBH)

    # Pot d'échappement (arrière droit)
    p['exhaust'] = cyl("Exhaust", HX+0.65, HY+HD*0.72, HZ+HH+0.42, 0.23, 0.88, verts=8)

    # Roues motrices (avant des chenilles, axe Y)
    sk_x = TX + TDX
    sk_z = HH / 2
    p['sprocket_far']  = cyl("SprocketFar",  sk_x, FTY+TW/2, sk_z, TW*0.44, TW*0.52, verts=14, axis='Y')
    p['sprocket_near'] = cyl("SprocketNear", sk_x, NTY+TW/2, sk_z, TW*0.44, TW*0.52, verts=14, axis='Y')

    # Roues de tension (arrière des chenilles, axe Y)
    id_x = TX
    p['idler_far']  = cyl("IdlerFar",  id_x, FTY+TW/2, sk_z, TW*0.40, TW*0.48, verts=14, axis='Y')
    p['idler_near'] = cyl("IdlerNear", id_x, NTY+TW/2, sk_z, TW*0.40, TW*0.48, verts=14, axis='Y')

    # Galets de roulement (5 par flanc, axe Y)
    for i, wx in enumerate(WHEEL_X_POSITIONS):
        p[f'wheel_f{i}'] = cyl(f"WheelFar{i}",  wx, FTY+TW*0.5, sk_z, TW*0.38, TW*0.44, verts=14, axis='Y')
        p[f'wheel_n{i}'] = cyl(f"WheelNear{i}", wx, NTY+TW*0.5, sk_z, TW*0.38, TW*0.44, verts=14, axis='Y')

    return p


# ─── Caméra isométrique orthographique ───────────────────────────────────────
def setup_camera():
    cam_data              = bpy.data.cameras.new("IsoCam")
    cam_data.type         = 'ORTHO'
    cam_data.ortho_scale  = ORTHO_SCALE
    cam_data.clip_end     = 200.0

    cam = bpy.data.objects.new("Camera", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    # Cible : centre du char, légèrement surélevé
    target = Vector(((HX+HW/2)*S, (HY+HD/2)*S, (HZ+HH)*S))

    # Angle isométrique : azimut 45°, élévation 35.264°
    dist = 25
    az   = math.radians(225)          # vue depuis haut-droite-avant
    el   = math.radians(35.264)
    offset = Vector((
        dist * math.cos(el) * math.cos(az),
        dist * math.cos(el) * math.sin(az),
        dist * math.sin(el),
    ))
    cam.location       = target + offset
    cam.rotation_euler = (target - cam.location).normalized().to_track_quat('-Z', 'Y').to_euler()

    return cam


# ─── Éclairage 3 points ───────────────────────────────────────────────────────
def setup_lights():
    # Lumière principale (haut-gauche, dure)
    bpy.ops.object.light_add(type='SUN')
    key = bpy.context.active_object
    key.data.energy       = 4.5
    key.data.angle        = math.radians(5)
    key.rotation_euler    = (math.radians(48), 0, math.radians(-42))

    # Lumière de remplissage (droite, douce)
    bpy.ops.object.light_add(type='SUN')
    fill = bpy.context.active_object
    fill.data.energy      = 1.8
    fill.data.angle       = math.radians(18)
    fill.rotation_euler   = (math.radians(58), 0, math.radians(125))

    # Lumière de contour (bas, très douce)
    bpy.ops.object.light_add(type='SUN')
    rim = bpy.context.active_object
    rim.data.energy       = 0.45
    rim.rotation_euler    = (math.radians(168), 0, math.radians(180))


# ─── Paramètres de rendu ──────────────────────────────────────────────────────
def setup_render():
    sc = bpy.context.scene
    sc.render.engine               = 'CYCLES'
    sc.cycles.samples              = SAMPLES
    sc.cycles.use_denoising        = True
    sc.render.resolution_x         = RENDER_W
    sc.render.resolution_y         = RENDER_H
    sc.render.resolution_percentage = 100
    sc.render.film_transparent     = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode  = 'RGBA'
    sc.render.image_settings.compression = 15

    # Lumière d'ambiance neutre (n'apparaît pas sur fond transparent)
    w = bpy.data.worlds.new("World")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.20
    sc.world = w


# ─── Assignation des matériaux pour une skin ──────────────────────────────────
def apply_skin(parts, skin_id, skin):
    m_body  = make_mat(f"body_{skin_id}",  skin['base'],  metal=skin['metal'], rough=skin['rough'])
    m_track = make_mat(f"track_{skin_id}", skin['track'], metal=0.00,          rough=0.88)
    m_gun   = make_mat(f"gun_{skin_id}",   GUN_COL,       metal=0.28,          rough=0.55)
    m_wheel = make_mat(f"wheel_{skin_id}", skin['track'], metal=0.15,          rough=0.65)

    body_parts  = ['hull', 'turret', 'cupola', 'exhaust']
    track_parts = ['far_track', 'near_track']
    gun_parts   = ['gun', 'muzzle']
    wheel_parts = (
        ['sprocket_far', 'sprocket_near', 'idler_far', 'idler_near']
        + [f'wheel_f{i}' for i in range(5)]
        + [f'wheel_n{i}' for i in range(5)]
    )

    for k in body_parts:  assign(parts[k], m_body)
    for k in track_parts: assign(parts[k], m_track)
    for k in gun_parts:   assign(parts[k], m_gun)
    for k in wheel_parts: assign(parts[k], m_wheel)


# ─── Main ─────────────────────────────────────────────────────────────────────
clear_scene()
parts = build_tank()
setup_camera()
setup_lights()
setup_render()

skins_to_render = (
    {PREVIEW_SKIN: SKINS[PREVIEW_SKIN]} if PREVIEW_SKIN else SKINS
)

print(f"\n{'═'*56}")
print(f"  ATFR Tank Render  •  {len(skins_to_render)} skin(s)  •  {SAMPLES} samples")
print(f"  → {OUTPUT_DIR}")
print(f"{'═'*56}\n")

for skin_id, skin in skins_to_render.items():
    apply_skin(parts, skin_id, skin)
    out = os.path.join(OUTPUT_DIR, f"tank-default-{skin_id}.png")
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"  ✓  {skin_id:12s}  →  {out}")

print(f"\n  Fini. Copier les PNG dans public/images/tank_avatars/\n")
