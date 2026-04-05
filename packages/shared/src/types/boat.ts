export type Boat = {
  id?: string;
  id_sail_boat_type?: string | null;
  boat_model: string | null;
  model: string;
  i: string | null;
  j: string | null;
  p: string | null;
  e: string | null;
  gg: string | null;
  lp: string | null;
  sl: string | null;
  smw: string | null;
  length: string | null;
  genoa_area: string | null;
  genoa_furler_area: string | null;
  mainsail_area: string | null;
  mainsail_full_area: string | null;
  mainsail_furler_area: string | null;
  spinnaker_area: string | null;
  spinnaker_asym_area: string | null;
  sgen_area: string | null;
  is_multihull: string | null;
  multi?: string | null;
  gn?: string | null;
  gse?: string | null;
  gen?: string | null;
  gvstd?: string | null;
  gvfull?: string | null;
  gve?: string | null;
  spisym?: string | null;
  spiasy?: string | null;
  furling?: string | null;
};

export type SailKey =
  | 'gvstd'
  | 'gvfull'
  | 'gve'
  | 'gse'
  | 'gn'
  | 'spiasy'
  | 'spisym'
  | 'furling'
  | 'gen';

export type SailGroup = 'main' | 'head' | 'spi';
