import { describe, expect, it } from '@jest/globals';
import {
  countTreesBySampling,
  getFieldPosition,
} from '../src/utils/fieldPosition';
import {
  areaRing,
  boundsOf,
  parseStoredCoordinate,
  SamplingShape,
} from '../src/utils/geo';
import { extrapolateTreesToArea } from '../src/services/inspection/extrapolateTreesToArea';

// A ~110 m square area.
const ring = areaRing([
  { latitude: '-23.0960', longitude: '-45.8050' },
  { latitude: '-23.0960', longitude: '-45.8040' },
  { latitude: '-23.0970', longitude: '-45.8040' },
  { latitude: '-23.0970', longitude: '-45.8050' },
]);

const sampling: SamplingShape = {
  id: 7,
  number: 1,
  center: [-45.8045, -23.0965],
  radius: 10,
};

describe('getFieldPosition', () => {
  it('waits while there is no GPS fix', () => {
    expect(getFieldPosition(null, ring, [sampling]).kind).toBe('waiting');
  });

  it('detects a position outside the area', () => {
    expect(getFieldPosition([-45.81, -23.0965], ring, [sampling]).kind).toBe(
      'outside',
    );
  });

  it('detects a position inside the area but outside the samplings', () => {
    expect(getFieldPosition([-45.8048, -23.0962], ring, [sampling]).kind).toBe(
      'inArea',
    );
  });

  it('detects the sampling the inspector is standing in', () => {
    const result = getFieldPosition([-45.80451, -23.09651], ring, [sampling]);
    expect(result).toEqual({ kind: 'inSampling', sampling });
  });
});

describe('parseStoredCoordinate', () => {
  it('reads coordinates saved as strings', () => {
    expect(
      parseStoredCoordinate('{"latitude":"-23.5","longitude":"-45.4"}'),
    ).toEqual([-45.4, -23.5]);
  });

  it('returns null for empty or invalid values', () => {
    expect(parseStoredCoordinate('')).toBeNull();
    expect(parseStoredCoordinate('{"latitude":"x"}')).toBeNull();
  });
});

describe('boundsOf', () => {
  it('returns the north-east and south-west corners', () => {
    expect(boundsOf(ring)).toEqual({
      ne: [-45.804, -23.096],
      sw: [-45.805, -23.097],
    });
  });
});

describe('countTreesBySampling', () => {
  it('counts trees per sampling id', () => {
    expect(
      countTreesBySampling([
        { samplingId: 1 },
        { samplingId: 1 },
        { samplingId: 2 },
      ]),
    ).toEqual({ 1: 2, 2: 1 });
  });
});

describe('extrapolateTreesToArea', () => {
  it('extrapolates the average density of the samplings to the area', () => {
    // 2 samplings of 10 m radius (314.16 m²) with 3 and 5 trees: an average
    // of 4 trees per 314.16 m², over 10,000 m².
    expect(
      extrapolateTreesToArea({
        samplingSize: 10,
        samplingTrees: [3, 5],
        totalArea: 10000,
      }),
    ).toBe(127);
  });
});
