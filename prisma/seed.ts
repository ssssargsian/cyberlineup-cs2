import {
  Difficulty,
  ImportSourceType,
  LineupStatus,
  Prisma,
  PrismaClient,
  Side,
  UtilityType
} from "@prisma/client";

const prisma = new PrismaClient();

const maps = [
  {
    name: "Dust 2",
    slug: "dust-2",
    description: "Классическая карта с быстрыми выходами, жёсткой борьбой за mid и сильной ролью смоков на B.",
    imageUrl: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Mirage",
    slug: "mirage",
    description: "Карта контроля middle, connector и многоуровневых A/B-выходов.",
    imageUrl: "https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Inferno",
    slug: "inferno",
    description: "Карта, где контроль Banana, тайминги и молотовы часто решают весь раунд.",
    imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Nuke",
    slug: "nuke",
    description: "Вертикальная карта с outside-смоками, upper-выходами и плотными таймингами.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Ancient",
    slug: "ancient",
    description: "Карта с плотными углами, контролем cave и выходами на сайты, где важна точная работа гранатами.",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Anubis",
    slug: "anubis",
    description: "Длинные линии, быстрые стычки за canal и агрессивные ротации между двумя плентами.",
    imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Vertigo",
    slug: "vertigo",
    description: "Карта, где давление на ramp, тайминги и точные гранаты имеют ключевое значение.",
    imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Overpass",
    slug: "overpass",
    description: "Карта с многоуровневым контролем, connector, toilets, long и выходами на B.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Office",
    slug: "office",
    description: "Закрытая карта с узкими проходами, флешками и контролем choke points.",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Train",
    slug: "train",
    description: "Длинные линии, layered bombsites и сильные гранаты вокруг trains, ladders и ivy.",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1400&q=80"
  }
] as const;

const manualSourceName = "CyberLineup SR Demo";
const externalSourceName = "ГАЙД CS2 / Раскидка гранат CS2";

const lineups = [
  {
    title: "Demo smoke to B doors from T spawn",
    slug: "demo-smoke-b-doors-dust-2",
    mapSlug: "dust-2",
    utilityType: UtilityType.smoke,
    side: Side.t,
    area: "B",
    fromPosition: "T spawn box edge",
    targetPosition: "B doors",
    difficulty: Difficulty.easy,
    throwType: "left-click",
    description: "Demo published lineup for smoke searches. Sample content for the MVP dataset.",
    steps: [
      "Move to the left edge of the T spawn box.",
      "Use your own reference note above the upper corner.",
      "Release a standard left-click smoke."
    ],
    tags: ["demo", "dust", "b", "smoke"],
    aliases: ["смок б даст", "smoke b doors dust2", "раскид на б dust 2"],
    isVerified: true,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo flash through mid on Mirage",
    slug: "demo-flash-mid-mirage",
    mapSlug: "mirage",
    utilityType: UtilityType.flash,
    side: Side.t,
    area: "Mid",
    fromPosition: "Top mid wall",
    targetPosition: "Mid swing",
    difficulty: Difficulty.easy,
    throwType: "left-click",
    description: "Published demo flash used to validate natural-language search and assistant grouping.",
    steps: [
      "Stand flush with the top mid wall.",
      "Aim above the roofline seam.",
      "Throw before your rifler swings."
    ],
    tags: ["demo", "mirage", "mid", "flash"],
    aliases: ["флеш мид mirage", "flash mid mirage"],
    isVerified: true,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo smoke for connector on Mirage",
    slug: "demo-smoke-connector-mirage",
    mapSlug: "mirage",
    utilityType: UtilityType.smoke,
    side: Side.t,
    area: "Connector",
    fromPosition: "Top mid bench",
    targetPosition: "Connector",
    difficulty: Difficulty.medium,
    throwType: "jumpthrow",
    description: "Published smoke to answer the core query example smoke connector mirage.",
    steps: [
      "Line up on the top mid bench.",
      "Aim at the top-right balcony frame edge.",
      "Use a jumpthrow for consistency."
    ],
    tags: ["demo", "mirage", "connector", "smoke"],
    aliases: ["smoke connector mirage", "смок коннектор мираж"],
    isVerified: true,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo molotov for car on Inferno",
    slug: "demo-molotov-car-inferno",
    mapSlug: "inferno",
    utilityType: UtilityType.molotov,
    side: Side.t,
    area: "B",
    fromPosition: "Banana sandbags line",
    targetPosition: "Car",
    difficulty: Difficulty.medium,
    throwType: "left-click",
    description: "Published demo molotov for Banana pressure and search validation.",
    steps: [
      "Stop near the sandbags reference.",
      "Aim at the roof seam above car.",
      "Throw the molotov with a left-click."
    ],
    tags: ["demo", "inferno", "car", "molotov"],
    aliases: ["молик car inferno", "molotov car inferno"],
    isVerified: true,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo smoke for secret cross on Nuke",
    slug: "demo-smoke-secret-nuke",
    mapSlug: "nuke",
    utilityType: UtilityType.smoke,
    side: Side.t,
    area: "Secret",
    fromPosition: "T red line",
    targetPosition: "Secret cross",
    difficulty: Difficulty.medium,
    throwType: "jumpthrow",
    description: "Published demo outside smoke to populate Nuke search results and map counters.",
    steps: [
      "Stand against the red line marker.",
      "Aim at the antenna point.",
      "Use a jumpthrow release."
    ],
    tags: ["demo", "nuke", "secret", "smoke"],
    aliases: ["smoke secret nuke", "смок секрет нюк"],
    isVerified: false,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo HE for cave pressure on Ancient",
    slug: "demo-he-cave-ancient",
    mapSlug: "ancient",
    utilityType: UtilityType.he,
    side: Side.ct,
    area: "Cave",
    fromPosition: "B platform corner",
    targetPosition: "Cave entrance",
    difficulty: Difficulty.easy,
    throwType: "left-click",
    description: "Published demo HE to cover Ancient and validate HE-related searches.",
    steps: [
      "Hold the B platform corner.",
      "Aim into the center of cave.",
      "Throw as the execute starts."
    ],
    tags: ["demo", "ancient", "he", "cave"],
    aliases: ["he cave ancient", "хаешка кейв ancient"],
    isVerified: true,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo flash through canal on Anubis",
    slug: "demo-flash-canal-anubis",
    mapSlug: "anubis",
    utilityType: UtilityType.flash,
    side: Side.t,
    area: "Mid",
    fromPosition: "Canal stairs",
    targetPosition: "Canal exit",
    difficulty: Difficulty.medium,
    throwType: "right-click",
    description: "Published flash to demonstrate Anubis coverage with utility grouping.",
    steps: [
      "Stand on the second stair in canal.",
      "Aim above the arch.",
      "Right-click pop the flash."
    ],
    tags: ["demo", "anubis", "mid", "flash"],
    aliases: ["флеш мид анубис", "flash mid anubis"],
    isVerified: false,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo smoke for A ramp split on Vertigo",
    slug: "demo-smoke-a-ramp-vertigo",
    mapSlug: "vertigo",
    utilityType: UtilityType.smoke,
    side: Side.t,
    area: "Ramp",
    fromPosition: "T ramp sandbags",
    targetPosition: "A ramp defender angle",
    difficulty: Difficulty.hard,
    throwType: "runthrow",
    description: "Published hard-difficulty smoke to exercise filters and premium card layouts.",
    steps: [
      "Start behind the T ramp sandbags.",
      "Begin the short run-up.",
      "Release on the marked timing point."
    ],
    tags: ["demo", "vertigo", "ramp", "smoke"],
    aliases: ["смок рампа вертиго", "a ramp smoke vertigo"],
    isVerified: false,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo molotov for short B on Overpass",
    slug: "demo-molotov-short-b-overpass",
    mapSlug: "overpass",
    utilityType: UtilityType.molotov,
    side: Side.t,
    area: "Short",
    fromPosition: "Monster tunnel lip",
    targetPosition: "Short B",
    difficulty: Difficulty.medium,
    throwType: "jumpthrow",
    description: "Published B execute molotov used for map page counters and assistant results.",
    steps: [
      "Stand at the edge of Monster.",
      "Aim near the beam above short.",
      "Jumpthrow the molotov."
    ],
    tags: ["demo", "overpass", "short", "molotov"],
    aliases: ["молотов шорт оверпасс", "molotov short overpass"],
    isVerified: true,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Demo one-way smoke for window on Mirage",
    slug: "demo-oneway-window-mirage",
    mapSlug: "mirage",
    utilityType: UtilityType.oneway,
    side: Side.ct,
    area: "Window",
    fromPosition: "Window ledge",
    targetPosition: "Top Mid",
    difficulty: Difficulty.hard,
    throwType: "right-click",
    description: "Published one-way example to cover the oneway utility type in the MVP.",
    steps: [
      "Hold the window ledge edge.",
      "Aim at the narrow frame seam.",
      "Right-click toss to create the one-way."
    ],
    tags: ["demo", "mirage", "window", "oneway"],
    aliases: ["oneway window mirage", "ванвей окно мираж"],
    isVerified: false,
    status: LineupStatus.rejected,
    sourceName: manualSourceName,
    sourceUrl: null
  },
  {
    title: "Imported draft smoke from T-Roof to Window",
    slug: "imported-draft-smoke-t-roof-window",
    mapSlug: "mirage",
    utilityType: UtilityType.smoke,
    side: Side.t,
    area: "Window",
    fromPosition: "T-Roof",
    targetPosition: "Window",
    difficulty: Difficulty.unknown,
    throwType: null,
    description: "Draft import created to demonstrate moderation flow before publication.",
    steps: ["Review source page", "Confirm positions", "Publish after moderation"],
    tags: ["imported", "draft", "mirage"],
    aliases: ["smoke от t-roof на window"],
    isVerified: false,
    status: LineupStatus.pending_review,
    sourceName: externalSourceName,
    sourceUrl: "https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/stati/vertigo-counter-strike-2-raskidka-granat-2023.html"
  },
  {
    title: "Imported draft oneway from Jungle to Palace",
    slug: "imported-draft-oneway-jungle-palace",
    mapSlug: "mirage",
    utilityType: UtilityType.oneway,
    side: Side.ct,
    area: "Jungle",
    fromPosition: "Jungle",
    targetPosition: "Palace",
    difficulty: Difficulty.unknown,
    throwType: null,
    description: "Draft imported example with limited data, intentionally pending moderation.",
    steps: null,
    tags: ["imported", "draft", "oneway"],
    aliases: ["oneway jungle palace mirage"],
    isVerified: false,
    status: LineupStatus.draft,
    sourceName: externalSourceName,
    sourceUrl: "https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/stati/vertigo-counter-strike-2-raskidka-granat-2023.html"
  }
] as const;

async function main() {
  const seedSourceUrl =
    process.env.RASKIDKI_SOURCE_URL?.trim() || "https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/raskidki-granat-counter-strike-2/";

  for (const map of maps) {
    await prisma.map.upsert({
      where: { slug: map.slug },
      create: map,
      update: map
    });
  }

  await prisma.importSource.upsert({
    where: { name: externalSourceName },
    create: {
      name: externalSourceName,
      baseUrl: seedSourceUrl,
      type: ImportSourceType.website,
      isEnabled: true
    },
    update: {
      baseUrl: seedSourceUrl,
      type: ImportSourceType.website,
      isEnabled: true
    }
  });

  await prisma.importSource.upsert({
    where: { name: manualSourceName },
    create: {
      name: manualSourceName,
      baseUrl: "https://localhost/manual",
      type: ImportSourceType.manual,
      isEnabled: false
    },
    update: {
      baseUrl: "https://localhost/manual",
      type: ImportSourceType.manual,
      isEnabled: false
    }
  });

  const mapRecords = await prisma.map.findMany();
  const mapBySlug = new Map(mapRecords.map((record) => [record.slug, record.id]));

  for (const lineup of lineups) {
    const mapId = mapBySlug.get(lineup.mapSlug);

    if (!mapId) {
      throw new Error(`Map not found for slug ${lineup.mapSlug}`);
    }

    await prisma.lineup.upsert({
      where: { slug: lineup.slug },
      create: {
        title: lineup.title,
        slug: lineup.slug,
        mapId,
        utilityType: lineup.utilityType,
        side: lineup.side,
        area: lineup.area,
        fromPosition: lineup.fromPosition,
        targetPosition: lineup.targetPosition,
        difficulty: lineup.difficulty,
        throwType: lineup.throwType,
        description: lineup.description,
        steps: lineup.steps ? [...lineup.steps] : Prisma.JsonNull,
        videoUrl: null,
        previewImageUrl: null,
        aimImageUrl: null,
        positionImageUrl: null,
        tags: [...lineup.tags],
        aliases: [...lineup.aliases],
        isVerified: lineup.isVerified,
        status: lineup.status,
        sourceName: lineup.sourceName,
        sourceUrl: lineup.sourceUrl,
        importedAt: lineup.sourceUrl ? new Date() : null
      },
      update: {
        title: lineup.title,
        mapId,
        utilityType: lineup.utilityType,
        side: lineup.side,
        area: lineup.area,
        fromPosition: lineup.fromPosition,
        targetPosition: lineup.targetPosition,
        difficulty: lineup.difficulty,
        throwType: lineup.throwType,
        description: lineup.description,
        steps: lineup.steps ? [...lineup.steps] : Prisma.JsonNull,
        tags: [...lineup.tags],
        aliases: [...lineup.aliases],
        isVerified: lineup.isVerified,
        status: lineup.status,
        sourceName: lineup.sourceName,
        sourceUrl: lineup.sourceUrl,
        importedAt: lineup.sourceUrl ? new Date() : null
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
