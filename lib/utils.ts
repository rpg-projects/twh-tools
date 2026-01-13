export function calculateAge(birthStr: string): number {
  const referenceStr = "21/07/2023";
  const [birthDay, birthMonth, birthYear] = birthStr.split("/").map(Number);
  const [refDay, refMonth, refYear] = referenceStr.split("/").map(Number);

  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const referenceDate = new Date(refYear, refMonth - 1, refDay);

  let age = refYear - birthYear;

  const birthdayPassed =
    refMonth > birthMonth || (refMonth === birthMonth && refDay >= birthDay);

  if (!birthdayPassed) age--;

  return age;
}

export function mapearParagrafos(paragrafos: string[]): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (let i = 0; i < paragrafos.length - 1; i++) {
    mapa[paragrafos[i]] = paragrafos[i + 1];
  }
  return mapa;
}

export function normalizeGoogleDocLink(link: string): string {
  if (!link) return "";

  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const documentId = match?.[1];

  if (!documentId) return "";

  return `https://docs.google.com/document/d/${documentId}/preview`;
}
