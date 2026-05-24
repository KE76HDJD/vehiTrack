"""
================================================================================
VehiTrack Pro — seed_factory.py
Senior Data Engineer · QA Automation · Version 2.0 · Mai 2026
================================================================================
Script de génération de données de seed pour la base vehitrack.
Conforme aux formats officiels d'immatriculation togolais (DTRF).

Usage:
    pip install asyncpg faker passlib bcrypt
    python seed_factory.py

Connexion:
    host     : localhost
    database : vehitrack
    user     : vehitrack_user
    password : yaokouma
================================================================================
"""

import asyncio
import random
import re
import uuid
from datetime import datetime, timedelta, timezone

import asyncpg
import bcrypt

# ─── Configuration ────────────────────────────────────────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "database": "vehitrack",
    "user":     "vehitrack_user",
    "password": "yaokouma",
}

def hash_password(password: str) -> str:
    """Hash un mot de passe avec bcrypt (compatible Python 3.12)."""
    pwd_bytes = password.encode("utf-8")
    salt      = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

# ─── Seed fixe pour reproductibilité ─────────────────────────────────────────
random.seed(42)


# ==============================================================================
# SECTION 1 — DONNÉES CULTURELLES TOGOLAISES / OUEST-AFRICAINES
# ==============================================================================

TOGOLESE_FIRST_NAMES = [
    "Afi", "Akosua", "Akoua", "Abla", "Ama", "Efua", "Enyonam", "Efia",
    "Sena", "Yawa", "Mawuli", "Kossi", "Koffi", "Kodjo", "Kwame", "Edem",
    "Yawo", "Atsu", "Dela", "Selom", "Dzidzor", "Makafui", "Yao", "Komla",
    "Kafui", "Gbénou", "Ayélé", "Amèvi", "Fifonsi", "Dédé",
]

TOGOLESE_LAST_NAMES = [
    "Mensah", "Kouma", "Agbobli", "Lawson", "Ayité",
    "Diallo", "Diop", "Koffi", "Kodjo", "Essi",
    "Abalo", "Akakpo", "Amega", "Anani", "Assih",
    "Dagnon", "Dosseh", "Gbati", "Gnama", "Honou",
    "Kakanou", "Komi", "Lalle", "Nyametsi", "Ouro",
    "Tchangani", "Togbe", "Tsatsu", "Woekou", "Zinsou",
]

TOGOLESE_VEHICLE_BRANDS = [
    ("Toyota", "Corolla"),  ("Toyota", "HiLux"),   ("Toyota", "Land Cruiser"),
    ("Toyota", "Camry"),    ("Renault", "Clio"),    ("Renault", "Duster"),
    ("Peugeot", "206"),     ("Peugeot", "308"),     ("Nissan", "Pathfinder"),
    ("Nissan", "Navara"),   ("Mitsubishi", "L200"), ("Mitsubishi", "Pajero"),
    ("Hyundai", "i20"),     ("Kia", "Sportage"),    ("Mercedes", "Sprinter"),
    ("Isuzu", "D-Max"),     ("Ford", "Ranger"),     ("Volkswagen", "Polo"),
    ("Honda", "CR-V"),      ("Suzuki", "Vitara"),
]

COLORS = [
    "Blanc", "Noir", "Gris", "Argent", "Rouge",
    "Bleu", "Vert", "Beige", "Marron", "Orange",
]

ZONES = [
    {"name": "Zone A", "description": "Parking principal RDC",   "capacity": 20,
     "types": ["car", "van", "motorcycle"], "max_duration": 720},
    {"name": "Zone B", "description": "Parking sécurisé VIP",    "capacity": 10,
     "types": ["car", "vip"],               "max_duration": 480},
    {"name": "Zone C", "description": "Zone logistique camions", "capacity": 8,
     "types": ["truck", "van"],             "max_duration": 1440},
]

# ==============================================================================
# COMPTES DE DÉMONSTRATION — 4 ACTEURS DE LA PLATEFORME
# ==============================================================================
# Ces comptes sont créés avec des données fixées pour les tests d'intégration.
#
# ┌─────────────────────────────────┬──────────┬─────────────────────────────┐
# │ Email                           │ Rôle     │ Mot de passe                │
# ├─────────────────────────────────┼──────────┼─────────────────────────────┤
# │ admin@vehitrack.io              │ admin    │ Admin1234!                  │
# │ manager@vehitrack.io            │ manager  │ Vehitrack2026!              │
# │ gardien@vehitrack.io            │ gardien  │ Vehitrack2026!              │
# │ employe@vehitrack.io            │ employe  │ Vehitrack2026!              │
# └─────────────────────────────────┴──────────┴─────────────────────────────┘
DEMO_ACCOUNTS = [
    {
        "email": "admin@vehitrack.io",
        "password": "Admin1234!",
        "first_name": "Super",
        "last_name": "Admin",
        "role": "admin",
        "phone": "+22890000000",
    },
    {
        "email": "manager@vehitrack.io",
        "password": "Vehitrack2026!",
        "first_name": "Kossi",
        "last_name": "Mensah",
        "role": "manager",
        "phone": "+22891000001",
    },
    {
        "email": "gardien@vehitrack.io",
        "password": "Vehitrack2026!",
        "first_name": "Kwame",
        "last_name": "Agbobli",
        "role": "gardien",
        "phone": "+22892000002",
    },
    {
        "email": "employe@vehitrack.io",
        "password": "Vehitrack2026!",
        "first_name": "Ama",
        "last_name": "Diallo",
        "role": "employe",
        "phone": "+22893000003",
    },
]


# ==============================================================================
# SECTION 2 — FABRIQUE DE PLAQUES TOGOLAISES (DTRF-COMPLIANT)
# ==============================================================================

PLATE_REGEX = re.compile(
    r"^(\d{4}-[A-Z]{2}|TG[A-Z]{1,2}-\d{4}|\d{2}-CD-\d{2})$"
)

_used_plates: set = set()


def _generate_unique(generator_fn) -> str:
    for _ in range(1000):
        plate = generator_fn()
        if plate not in _used_plates:
            _used_plates.add(plate)
            return plate
    raise RuntimeError("Impossible de générer une plaque unique après 1000 tentatives.")


def generate_regular_plate() -> str:
    """Véhicules particuliers, motos, VIP. Format DTRF : 1234-AB"""
    digits  = f"{random.randint(1000, 9999)}"
    letters = "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ", k=2))
    return f"{digits}-{letters}"


def generate_commercial_plate() -> str:
    """Véhicules commerciaux (van, truck). Format DTRF : 1234-CB"""
    digits       = f"{random.randint(1000, 9999)}"
    series_pool  = ["CB", "CC", "TC", "TR", "VH", "LC", "TK"]
    letters      = random.choice(series_pool)
    return f"{digits}-{letters}"


def generate_government_plate() -> str:
    """Véhicules d'État. Format DTRF : TGA-1234 ou TGAA-1234"""
    suffix_length = random.choice([1, 2])
    suffix        = "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ", k=suffix_length))
    digits        = f"{random.randint(1000, 9999)}"
    return f"TG{suffix}-{digits}"


def generate_diplomatic_plate() -> str:
    """Corps diplomatique. Format DTRF : 12-CD-34"""
    country_code = f"{random.randint(10, 99)}"
    sequence     = f"{random.randint(10, 99)}"
    return f"{country_code}-CD-{sequence}"


def plate_factory(vehicle_type: str, is_admin_owned: bool = False,
                  is_diplomatic: bool = False) -> str:
    if is_diplomatic and vehicle_type == "vip":
        plate = _generate_unique(generate_diplomatic_plate)
    elif is_admin_owned and vehicle_type in ("car", "vip"):
        if random.random() < 0.4:
            plate = _generate_unique(generate_government_plate)
        else:
            plate = _generate_unique(generate_regular_plate)
    elif vehicle_type in ("van", "truck"):
        plate = _generate_unique(generate_commercial_plate)
    elif vehicle_type in ("car", "motorcycle", "vip"):
        plate = _generate_unique(generate_regular_plate)
    else:
        plate = _generate_unique(generate_regular_plate)

    assert PLATE_REGEX.match(plate), f"Plaque invalide générée : {plate}"
    return plate


def validate_plate(plate: str) -> bool:
    return bool(PLATE_REGEX.match(plate))


# ==============================================================================
# SECTION 3 — GÉNÉRATEUR DE SESSIONS — PICS DE TRAFIC LOMÉ
# ==============================================================================

def lome_business_hours_entry(base_date: datetime) -> datetime:
    """
    Génère un timestamp d'entrée réaliste selon les pics de trafic de Lomé.
    Matin 07:30–09:00 (35%) · Journée 09-12h (20%) · Pause 12-14h (15%)
    Après-midi 14-17h (15%) · Soir 17:00–18:30 (15%)
    """
    weights = [35, 20, 15, 15, 15]
    slots   = [
        (7, 30,  9,  0),
        (9,  0, 12,  0),
        (12, 0, 14,  0),
        (14, 0, 17,  0),
        (17, 0, 18, 30),
    ]
    slot                            = random.choices(slots, weights=weights, k=1)[0]
    h_start, m_start, h_end, m_end = slot
    start_minutes                   = h_start * 60 + m_start
    end_minutes                     = h_end   * 60 + m_end
    chosen_minute                   = random.randint(start_minutes, end_minutes - 1)

    return base_date.replace(
        hour=chosen_minute // 60,
        minute=chosen_minute % 60,
        second=random.randint(0, 59),
        microsecond=0,
    )


def normal_duration_minutes(zone_name: str) -> int:
    distributions = {
        "Zone A": (90,  30),
        "Zone B": (60,  20),
        "Zone C": (240, 60),
    }
    mu, sigma = distributions.get(zone_name, (90, 30))
    return max(5, min(int(random.gauss(mu, sigma)), 720))


def anomaly_duration_minutes(zone_name: str) -> int:
    if random.random() < 0.5:
        return random.randint(1, 3)
    else:
        return random.randint(600, 720)


# ==============================================================================
# SECTION 4 — SCRIPT PRINCIPAL ASYNC
# ==============================================================================

async def seed_database():
    print("=" * 70)
    print("VehiTrack Pro — Seed Factory v2.0")
    print("Connecting to PostgreSQL…")
    print("=" * 70)

    conn = await asyncpg.connect(**DB_CONFIG)

    try:
        # ── Nettoyer les données existantes (ordre FK) ─────────────────────
        print("\n[1/8] Nettoyage des données existantes…")
        await conn.execute("""
            TRUNCATE
                access_ctrl.access_rights,
                core.reservations,
                core.vehicle_sessions,
                core.alerts,
                core.vehicles,
                core.parking_slots,
                core.zones,
                core.employees
            RESTART IDENTITY CASCADE;
        """)
        print("      ✓ Tables vidées.")

        # ── 1. Comptes de démonstration (4 acteurs fixes) ──────────────────
        print("\n[2/8] Insertion des 4 comptes de démonstration (acteurs fixes)…")
        employees   = []
        admin_id    = None

        for account in DEMO_ACCOUNTS:
            emp_id   = str(uuid.uuid4())
            emp_hash = hash_password(account["password"])

            await conn.execute("""
                INSERT INTO core.employees
                    (employee_id, email, hashed_password, first_name, last_name,
                     role, phone, is_active)
                VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
            """, emp_id, account["email"], emp_hash,
                 account["first_name"], account["last_name"],
                 account["role"], account["phone"])

            employees.append({"id": emp_id, "role": account["role"], "email": account["email"]})
            if account["role"] == "admin":
                admin_id = emp_id
            print(f"      ✓ {account['email']} ({account['role']})")

        # ── 2. Employés supplémentaires (26) ──────────────────────────────
        print("\n      Génération de 26 employés aléatoires togolais…")
        seen_emails = {a["email"] for a in DEMO_ACCOUNTS}
        roles_pool  = (["manager"] * 2 + ["gardien"] * 5 + ["employe"] * 19)
        random.shuffle(roles_pool)

        for i, role in enumerate(roles_pool):
            first = random.choice(TOGOLESE_FIRST_NAMES)
            last  = random.choice(TOGOLESE_LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}@vehitrack.io"
            counter = 1
            while email in seen_emails:
                email = f"{first.lower()}.{last.lower()}{counter}@vehitrack.io"
                counter += 1
            seen_emails.add(email)

            emp_id   = str(uuid.uuid4())
            emp_hash = hash_password("Vehitrack2026!")
            phone    = f"+2289{random.randint(0,9)}{random.randint(1000000, 9999999)}"

            await conn.execute("""
                INSERT INTO core.employees
                    (employee_id, email, hashed_password, first_name, last_name,
                     role, phone, is_active)
                VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
            """, emp_id, email, emp_hash, first, last, role, phone)
            employees.append({"id": emp_id, "role": role, "email": email})

        print(f"      ✓ {len(employees)} employés au total.")

        # ── 3. Zones (3) ──────────────────────────────────────────────────
        print("\n[3/8] Insertion des 3 zones de parking…")
        zone_ids: dict = {}

        for z in ZONES:
            zid     = str(uuid.uuid4())
            zone_ids[z["name"]] = zid
            await conn.execute("""
                INSERT INTO core.zones
                    (zone_id, name, description, capacity,
                     allowed_vehicle_types, max_duration_minutes, is_active)
                VALUES ($1,$2,$3,$4,$5::core.vehicle_type[],$6,TRUE)
            """, zid, z["name"], z["description"],
                 z["capacity"], z["types"], z["max_duration"])
            print(f"      ✓ {z['name']} (capacité {z['capacity']})")

        # ── 4. Slots parking ──────────────────────────────────────────────
        print("\n[4/8] Insertion des slots de parking…")
        slot_ids: dict = {name: [] for name in zone_ids}

        slot_configs = [
            ("Zone A", "A", 20, ["pmr", "pmr", *["standard"] * 16, "motorcycle", "motorcycle"]),
            ("Zone B", "B", 10, ["vip"] * 10),
            ("Zone C", "C", 8,  ["truck"] * 4 + ["standard"] * 4),
        ]

        for zone_name, prefix, count, types in slot_configs:
            zid = zone_ids[zone_name]
            for n in range(1, count + 1):
                sid   = str(uuid.uuid4())
                code  = f"{prefix}-{str(n).zfill(2)}"
                stype = types[n - 1] if n - 1 < len(types) else "standard"
                pos_x = float(((n - 1) % 5) * 60)
                pos_y = float(((n - 1) // 5) * 40)

                await conn.execute("""
                    INSERT INTO core.parking_slots
                        (slot_id, zone_id, slot_code, slot_type,
                         slot_status, pos_x, pos_y, is_active)
                    VALUES ($1,$2,$3,$4::core.slot_type,'available',$5,$6,TRUE)
                """, sid, zid, code, stype, pos_x, pos_y)
                slot_ids[zone_name].append(sid)

        print(f"      ✓ {sum(len(v) for v in slot_ids.values())} slots insérés.")

        # ── 5. Véhicules (40) ─────────────────────────────────────────────
        print("\n[5/8] Génération de 40 véhicules avec plaques DTRF-Togolaises…")
        admin_ids   = [e["id"] for e in employees if e["role"] == "admin"]
        all_emp_ids = [e["id"] for e in employees]

        vehicle_configs = [
            ("car",        18, False),
            ("motorcycle",  5, False),
            ("van",         6, False),
            ("truck",       5, False),
            ("vip",         4, False),
            ("vip",         2, True),
        ]

        vehicles: list = []

        for vtype, count, is_diplomatic in vehicle_configs:
            for _ in range(count):
                if vtype in ("vip", "car") and admin_ids and random.random() < 0.2:
                    owner_id = random.choice(admin_ids)
                    is_gov   = True
                else:
                    owner_id = random.choice(all_emp_ids)
                    is_gov   = False

                plate        = plate_factory(vtype, is_admin_owned=is_gov, is_diplomatic=is_diplomatic)
                brand, model = random.choice(TOGOLESE_VEHICLE_BRANDS)
                color        = random.choice(COLORS)
                vid          = str(uuid.uuid4())

                await conn.execute("""
                    INSERT INTO core.vehicles
                        (vehicle_id, owner_id, plate_number, plate_country,
                         vehicle_type, brand, model, color, is_active)
                    VALUES ($1,$2,$3,'TG',$4::core.vehicle_type,$5,$6,$7,TRUE)
                """, vid, owner_id, plate, vtype, brand, model, color)

                vehicles.append({"id": vid, "type": vtype, "plate": plate, "owner": owner_id})
                print(f"      ✓ [{vtype:12s}] {plate:15s} — {brand} {model} {color}")

        print(f"\n      ✓ {len(vehicles)} véhicules insérés.")

        # ── 6. Droits d'accès ─────────────────────────────────────────────
        print("\n[6/8] Création des droits d'accès…")
        admin_id_main = admin_ids[0] if admin_ids else employees[0]["id"]

        for v in vehicles:
            if v["type"] in ("truck", "van"):
                eligible_zones = ["Zone C", "Zone A"]
            elif v["type"] == "vip":
                eligible_zones = ["Zone B", "Zone A"]
            else:
                eligible_zones = ["Zone A"]

            for zone_name in eligible_zones:
                zid   = zone_ids[zone_name]
                level = "vip" if v["type"] == "vip" else "standard"
                await conn.execute("""
                    INSERT INTO access_ctrl.access_rights
                        (vehicle_id, zone_id, access_level, allowed_days,
                         allowed_hours, is_active, granted_by)
                    VALUES ($1,$2,$3::access_ctrl.access_level,
                            '{1,2,3,4,5}'::INTEGER[],
                            '{"start":"07:00","end":"19:00"}'::JSONB,
                            TRUE,$4)
                """, v["id"], zid, level, admin_id_main)
        print(f"      ✓ Droits créés pour {len(vehicles)} véhicules.")

        # ── 7. Sessions historiques (1 500) ───────────────────────────────
        print("\n[7/8] Génération de 1 500 sessions historiques (30 jours)…")
        now_utc       = datetime.now(timezone.utc)
        sessions_inserted = 0

        eligible_pairs: list = []
        for v in vehicles:
            if v["type"] in ("truck", "van"):
                for zname in ["Zone C", "Zone A"]:
                    eligible_pairs.append({"vehicle_id": v["id"], "zone_name": zname,
                                           "zone_id": zone_ids[zname], "slots": slot_ids[zname]})
            elif v["type"] == "vip":
                for zname in ["Zone B", "Zone A"]:
                    eligible_pairs.append({"vehicle_id": v["id"], "zone_name": zname,
                                           "zone_id": zone_ids[zname], "slots": slot_ids[zname]})
            else:
                eligible_pairs.append({"vehicle_id": v["id"], "zone_name": "Zone A",
                                       "zone_id": zone_ids["Zone A"], "slots": slot_ids["Zone A"]})

        TARGET_SESSIONS  = 1500
        TARGET_ANOMALIES = 10
        anomalies_injected = 0
        daily_sessions: list = []

        for d in range(30):
            base_d = (now_utc - timedelta(days=30 - d)).replace(hour=0, minute=0, second=0, microsecond=0)
            if base_d.weekday() < 5:
                daily_sessions.append(random.randint(45, 65))
            else:
                daily_sessions.append(random.randint(10, 25))

        delta = TARGET_SESSIONS - sum(daily_sessions)
        for i in range(abs(delta)):
            daily_sessions[i % 30] += (1 if delta > 0 else -1)

        session_records: list = []

        for day_idx, day_count in enumerate(daily_sessions):
            base_date = (now_utc - timedelta(days=30 - day_idx)).replace(
                hour=0, minute=0, second=0, microsecond=0)
            if base_date.weekday() == 6:
                day_count = max(3, day_count // 3)

            for _ in range(day_count):
                pair         = random.choice(eligible_pairs)
                entry_time   = lome_business_hours_entry(base_date)
                force_anomaly = (anomalies_injected < TARGET_ANOMALIES and
                                 TARGET_SESSIONS - sessions_inserted <= TARGET_ANOMALIES - anomalies_injected + 5)

                if force_anomaly:
                    duration = anomaly_duration_minutes(pair["zone_name"])
                    anomalies_injected += 1
                else:
                    duration = normal_duration_minutes(pair["zone_name"])

                exit_time = entry_time + timedelta(minutes=duration)
                if exit_time.date() > base_date.date():
                    exit_time = base_date.replace(hour=22, minute=59, second=0)
                    duration  = int((exit_time - entry_time).total_seconds() / 60)

                slot_id    = random.choice(pair["slots"]) if pair["slots"] else None
                session_id = str(uuid.uuid4())
                confidence = round(random.uniform(75.0, 99.5), 1)

                session_records.append((
                    session_id, pair["vehicle_id"], pair["zone_id"], slot_id,
                    entry_time, exit_time, duration, confidence,
                ))
                sessions_inserted += 1

        BATCH = 100
        for i in range(0, len(session_records), BATCH):
            batch = session_records[i:i + BATCH]
            await conn.executemany("""
                INSERT INTO core.vehicle_sessions
                    (session_id, vehicle_id, zone_id, slot_id,
                     entry_time, exit_time, duration_minutes,
                     status, ocr_confidence, is_anomaly)
                VALUES ($1,$2,$3,$4,$5,$6,$7,'completed',$8,FALSE)
            """, batch)
            print(f"      … {min(i + BATCH, len(session_records))}/{len(session_records)}", end="\r")

        print(f"\n      ✓ {sessions_inserted} sessions insérées. ({anomalies_injected} anomalies injectées)")

        # ── 8. Sessions suspectes pour trigger IQR ────────────────────────
        print("\n[8/8] Injection des 10 sessions suspectes (test trigger IQR)…")
        anomaly_pairs = random.choices(eligible_pairs, k=10)

        for idx, pair in enumerate(anomaly_pairs):
            session_id  = str(uuid.uuid4())
            entry_time  = (now_utc - timedelta(days=random.randint(1, 10))).replace(
                hour=random.choice([8, 17]), minute=random.randint(0, 59),
                second=0, microsecond=0)
            confidence  = round(random.uniform(80.0, 97.0), 1)
            slot_id     = random.choice(pair["slots"]) if pair["slots"] else None

            await conn.execute("""
                INSERT INTO core.vehicle_sessions
                    (session_id, vehicle_id, zone_id, slot_id,
                     entry_time, status, ocr_confidence, is_anomaly)
                VALUES ($1,$2,$3,$4,$5,'active',$6,FALSE)
            """, session_id, pair["vehicle_id"], pair["zone_id"], slot_id, entry_time, confidence)

            anomaly_dur = anomaly_duration_minutes(pair["zone_name"])
            exit_time   = entry_time + timedelta(minutes=anomaly_dur)
            await conn.execute("""
                UPDATE core.vehicle_sessions SET exit_time = $1
                WHERE session_id = $2 AND entry_time = $3
            """, exit_time, session_id, entry_time)
            print(f"      ✓ Session suspecte #{idx + 1} — {anomaly_dur}min — {pair['zone_name']}")

        # ── Rafraîchissement des vues matérialisées ───────────────────────
        print("\n      Rafraîchissement des vues matérialisées analytics…")
        try:
            await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.entry_heatmap;")
            await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.daily_stats;")
            print("      ✓ Vues analytics rafraîchies.")
        except Exception as e:
            print(f"      ⚠ Vues matérialisées non disponibles (requiert TimescaleDB): {e}")

        # ── Rapport final ──────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("RAPPORT DE SEED — VehiTrack Pro")
        print("=" * 70)
        counts = await conn.fetch("""
            SELECT 'employees'         AS tbl, COUNT(*) AS n FROM core.employees
            UNION ALL SELECT 'vehicles',       COUNT(*) FROM core.vehicles
            UNION ALL SELECT 'zones',          COUNT(*) FROM core.zones
            UNION ALL SELECT 'parking_slots',  COUNT(*) FROM core.parking_slots
            UNION ALL SELECT 'access_rights',  COUNT(*) FROM access_ctrl.access_rights
            UNION ALL SELECT 'vehicle_sessions', COUNT(*) FROM core.vehicle_sessions
            UNION ALL SELECT 'sessions_anomaly', COUNT(*)
              FROM core.vehicle_sessions WHERE is_anomaly = TRUE
            ORDER BY tbl;
        """)

        for row in counts:
            print(f"  {row['tbl']:25s} → {row['n']:>6} lignes")

        print("\n  ┌─────────────────────────────────┬──────────┬─────────────────┐")
        print("  │ Email                           │ Rôle     │ Mot de passe    │")
        print("  ├─────────────────────────────────┼──────────┼─────────────────┤")
        for a in DEMO_ACCOUNTS:
            print(f"  │ {a['email']:31s} │ {a['role']:8s} │ {a['password']:15s} │")
        print("  └─────────────────────────────────┴──────────┴─────────────────┘")

        print("\n✅ Seed terminé avec succès.")
        print("=" * 70)

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
