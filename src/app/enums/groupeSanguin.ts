export enum GroupeSanguin {
  A_POSITIF = 'A+',
  A_NEGATIF = 'A-',
  B_POSITIF = 'B+',
  B_NEGATIF = 'B-',
  AB_POSITIF = 'AB+',
  AB_NEGATIF = 'AB-',
  O_POSITIF = 'O+',
  O_NEGATIF = 'O-',
  INCONNU = 'Inconnu',
}

export function fromLabel(label: string): GroupeSanguin {
  const groupeSanguin = Object.values(GroupeSanguin).find(
    gs => gs === label.toUpperCase()
  );
  return groupeSanguin || GroupeSanguin.INCONNU;
}
