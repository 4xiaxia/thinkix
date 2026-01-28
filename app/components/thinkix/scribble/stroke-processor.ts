import { distanceBetweenPointAndPoint, Point } from '@plait/core';

interface StrokeDataPoint {
  coordinates: Point;
  pressure?: number;
  timestamp: number;
  tiltX?: number;
  tiltY?: number;
}

interface ProcessorConfig {
  smoothingFactor?: number;
  velocityInfluence?: number;
  curvatureInfluence?: number;
  minPointDistance?: number;
  historySize?: number;
  pressureSensitivity?: number;
  tiltSensitivity?: number;
  velocityThreshold?: number;
  sampleInterval?: number;
}

export class StrokeProcessor {
  private readonly defaults: Required<ProcessorConfig> = {
    smoothingFactor: 0.65,
    velocityInfluence: 0.2,
    curvatureInfluence: 0.3,
    minPointDistance: 0.2,
    historySize: 8,
    pressureSensitivity: 0.5,
    tiltSensitivity: 0.3,
    velocityThreshold: 800,
    sampleInterval: 5,
  };

  private config: Required<ProcessorConfig>;
  private strokeHistory: StrokeDataPoint[] = [];
  private lastTimestamp = 0;
  private velocityBuffer: number[] = [];
  private readonly velocityBufferLimit = 3;

  constructor(settings: ProcessorConfig = {}) {
    this.config = { ...this.defaults, ...settings };
  }

  addPoint(
    coordinates: Point,
    metadata: Partial<Omit<StrokeDataPoint, 'coordinates'>> = {}
  ): Point | null {
    const now = metadata.timestamp ?? Date.now();

    if (this.strokeHistory.length === 0) {
      const firstPoint: StrokeDataPoint = {
        coordinates,
        timestamp: now,
        ...metadata,
      };
      this.strokeHistory.push(firstPoint);
      this.lastTimestamp = now;
      return coordinates;
    }

    if (now - this.lastTimestamp < this.config.sampleInterval) {
      const delta = now - this.lastTimestamp;
      if (delta < 2) {
        return null;
      }
    }

    const newPoint: StrokeDataPoint = {
      coordinates,
      timestamp: now,
      ...metadata,
    };

    if (!this.isPointFarEnough(coordinates) && this.strokeHistory.length > 1) {
      const delta = now - this.lastTimestamp;
      if (delta < 32) {
        return null;
      }
    }

    this.addToHistory(newPoint);
    const adaptiveParams = this.computeAdaptiveParams(newPoint);
    const smoothed = this.applySmoothing(coordinates, adaptiveParams);

    this.lastTimestamp = now;
    return smoothed;
  }

  reset(): void {
    this.strokeHistory = [];
    this.lastTimestamp = 0;
    this.velocityBuffer = [];
  }

  private addToHistory(point: StrokeDataPoint): void {
    this.strokeHistory.push(point);
    if (this.strokeHistory.length > this.config.historySize) {
      this.strokeHistory.shift();
    }
  }

  private isPointFarEnough(point: Point): boolean {
    if (this.strokeHistory.length === 0) return true;

    const lastPoint = this.strokeHistory[this.strokeHistory.length - 1]
      .coordinates;
    const dist = this.computeDistance(lastPoint, point);

    let minRequiredDist = this.config.minPointDistance;
    if (this.velocityBuffer.length > 0) {
      const avgVel = this.getAverageVelocity();
      minRequiredDist *= Math.max(0.5, Math.min(1.5, avgVel / 200));
    }

    return dist >= minRequiredDist;
  }

  private computeAdaptiveParams(point: StrokeDataPoint) {
    const vel = this.calculateVelocity(point);
    this.updateVelocityBuffer(vel);
    const avgVel = this.getAverageVelocity();

    const params = { ...this.config };

    if (point.pressure !== undefined) {
      const pressureEffect = Math.pow(point.pressure, 1.2);
      params.smoothingFactor *=
        1 - pressureEffect * params.pressureSensitivity * 0.8;
    }

    const velocityRatio = Math.min(avgVel / params.velocityThreshold, 1);
    params.velocityInfluence = 0.2 + velocityRatio * 0.3;
    params.smoothingFactor *= 1 + velocityRatio * 0.2;

    if (point.tiltX !== undefined && point.tiltY !== undefined) {
      const tiltMagnitude =
        Math.sqrt(point.tiltX ** 2 + point.tiltY ** 2) / 90;
      params.smoothingFactor *=
        1 + tiltMagnitude * params.tiltSensitivity * 0.7;
    }

    return params;
  }

  private applySmoothing(
    point: Point,
    params: Required<ProcessorConfig>
  ): Point {
    if (this.strokeHistory.length < 2) return point;

    const weights = this.computeWeights(params);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    if (totalWeight === 0) return point;

    const result: Point = [0, 0];
    for (let i = 0; i < this.strokeHistory.length; i++) {
      const weight = weights[i] / totalWeight;
      result[0] += this.strokeHistory[i].coordinates[0] * weight;
      result[1] += this.strokeHistory[i].coordinates[1] * weight;
    }

    return result;
  }

  private computeWeights(params: Required<ProcessorConfig>): number[] {
    const weights: number[] = [];
    const lastIndex = this.strokeHistory.length - 1;

    for (let i = 0; i < this.strokeHistory.length; i++) {
      let weight = Math.pow(params.smoothingFactor, (lastIndex - i) * 0.8);

      if (i < lastIndex) {
        const ptVel = this.getPointVelocityAtIndex(i);
        weight *= 1 + ptVel * params.velocityInfluence * 0.8;
      }

      if (i > 0 && i < lastIndex) {
        const ptCurve = this.getPointCurvatureAtIndex(i);
        weight *= 1 + ptCurve * params.curvatureInfluence * 0.7;
      }

      weights.push(weight);
    }

    return weights;
  }

  private computeDistance(p1: Point, p2: Point): number {
    return distanceBetweenPointAndPoint(p1[0], p1[1], p2[0], p2[1]);
  }

  private calculateVelocity(point: StrokeDataPoint): number {
    if (this.strokeHistory.length < 2) return 0;

    const prev = this.strokeHistory[this.strokeHistory.length - 1];
    const dist = this.computeDistance(prev.coordinates, point.coordinates);
    const timeDelta = point.timestamp - prev.timestamp;
    return timeDelta > 0 ? dist / timeDelta : 0;
  }

  private updateVelocityBuffer(velocity: number): void {
    this.velocityBuffer.push(velocity);
    if (this.velocityBuffer.length > this.velocityBufferLimit) {
      this.velocityBuffer.shift();
    }
  }

  private getAverageVelocity(): number {
    if (this.velocityBuffer.length === 0) return 0;
    return (
      this.velocityBuffer.reduce((a, b) => a + b) / this.velocityBuffer.length
    );
  }

  private getPointVelocityAtIndex(index: number): number {
    if (index >= this.strokeHistory.length - 1) return 0;

    const p1 = this.strokeHistory[index];
    const p2 = this.strokeHistory[index + 1];
    const dist = this.computeDistance(p1.coordinates, p2.coordinates);
    const timeDelta = p2.timestamp - p1.timestamp;
    return timeDelta > 0 ? dist / timeDelta : 0;
  }

  private getPointCurvatureAtIndex(index: number): number {
    if (index <= 0 || index >= this.strokeHistory.length - 1) return 0;

    const p1 = this.strokeHistory[index - 1].coordinates;
    const p2 = this.strokeHistory[index].coordinates;
    const p3 = this.strokeHistory[index + 1].coordinates;

    const a = this.computeDistance(p1, p2);
    const b = this.computeDistance(p2, p3);
    const c = this.computeDistance(p1, p3);

    const s = (a + b + c) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    return (4 * area) / (a * b * c + 0.0001);
  }
}
