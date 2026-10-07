export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const schemes = [
    {
      codeName: "PLAN Z-SUBTERRANEAN",
      summary: "Tunnel directly beneath the Krusty Krab grill using an oversized robotic mechanical earthworm disguised as a sea cucumber.",
      stepList: [
        "1. Dig 40 feet below the Chum Bucket storage room.",
        "2. Surface precisely inside the Krusty Krab kitchen safe.",
        "3. Replace the Krabby Patty formula bottle with a bottle of clam juice.",
        "4. Escape before Eugene Krabs finishes counting his penny jar."
      ],
      probability: "0.04%",
      fatalFlaw: "You forgot that Bikini Bottom rests on a bedrock of volcanic granite, and the drill will blow the Chum Bucket's fuses.",
      karenCommentary: "Oh Sheldon, I simulated this 4,000 times. You will end up resurfacing in Mrs. Puff's Boating School classroom again.",
      equipmentNeeded: ["Mechanical Earthworm", "Fake Formula Bottle", "Earplugs for Krabs' Screaming"]
    },
    {
      codeName: "OPERATION: TROJAN CLAM",
      summary: "Deliver a giant golden gift clam to the Krusty Krab doorstep with Plankton hiding inside dressed as a delivery boy.",
      stepList: [
        "1. Construct a paper-mâché clam coated in fake 24-karat gold leaf.",
        "2. Label it 'FREE MONEY INSIDE - OPEN IMMEDIATELY'.",
        "3. Wait for Krabs' greed to draw him in.",
        "4. Leap out and snatch the formula from his claw."
      ],
      probability: "1.2%",
      fatalFlaw: "Mr. Krabs will immediately sell the giant clam to a pawn shop before ever opening it.",
      karenCommentary: "A brilliant psychological trap, honey... if your target wasn't the cheapest crustacean in the Pacific Ocean.",
      equipmentNeeded: ["Fake Gold Paint", "Giant Clam Shell", "Tiny Net"]
    }
  ];

  const picked = schemes[Math.floor(Math.random() * schemes.length)];
  return res.status(200).json(picked);
}
