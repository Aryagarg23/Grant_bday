export class ObstacleManager {
  private obstacles: Obstacle[] = [];
  private canvas: HTMLCanvasElement;
  private gapSize: number = 200;
  private defaultGapSize: number = 200;
  private speed: number = 300;
  private defaultSpeed: number = 300;
  private spawnInterval: number = 2;
  private timeSinceLastSpawn: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.spawnObstacle();
  }

  private spawnObstacle() {
    const minGap = 100;
    const maxGap = this.canvas.height - 100 - this.gapSize;
    const gapY = minGap + Math.random() * (maxGap - minGap);

    this.obstacles.push({
      x: this.canvas.width,
      gapY,
      passed: false,
    });
  }

  public update(deltaTime: number) {
    this.timeSinceLastSpawn += deltaTime;
    if (this.timeSinceLastSpawn > this.spawnInterval) {
      this.spawnObstacle();
      this.timeSinceLastSpawn = 0;
    }

    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.x -= this.speed * deltaTime;
      return obstacle.x + 60 > 0;
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#4CAF50';
    this.obstacles.forEach((obstacle) => {
      // Top pipe
      ctx.fillRect(obstacle.x, 0, 60, obstacle.gapY);
      
      // Bottom pipe
      ctx.fillRect(
        obstacle.x,
        obstacle.gapY + this.gapSize,
        60,
        this.canvas.height - (obstacle.gapY + this.gapSize)
      );

      // Pipe caps
      ctx.fillStyle = '#2E7D32';
      // Top cap
      ctx.fillRect(obstacle.x - 10, obstacle.gapY - 20, 80, 20);
      // Bottom cap
      ctx.fillRect(obstacle.x - 10, obstacle.gapY + this.gapSize, 80, 20);
      ctx.fillStyle = '#4CAF50';
    });
  }

  public checkCollision(bird: any) {
    const birdBounds = bird.getBounds();
    return this.obstacles.some((obstacle) => {
      // Check collision with top pipe
      if (
        this.rectIntersect(birdBounds, {
          x: obstacle.x,
          y: 0,
          width: 60,
          height: obstacle.gapY,
        })
      ) {
        return true;
      }

      // Check collision with bottom pipe
      return this.rectIntersect(birdBounds, {
        x: obstacle.x,
        y: obstacle.gapY + this.gapSize,
        width: 60,
        height: this.canvas.height - (obstacle.gapY + this.gapSize),
      });
    });
  }

  private rectIntersect(a: any, b: any) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public checkScore(bird: any) {
    const birdX = bird.getBounds().x;
    let scored = false;

    this.obstacles.forEach((obstacle) => {
      if (!obstacle.passed && obstacle.x + 60 < birdX) {
        obstacle.passed = true;
        scored = true;
      }
    });

    return scored;
  }

  public increaseGap() {
    this.gapSize = this.defaultGapSize * 1.5;
  }

  public resetGap() {
    this.gapSize = this.defaultGapSize;
  }

  public increaseSpeed() {
    this.speed = this.defaultSpeed * 1.5;
  }

  public resetSpeed() {
    this.speed = this.defaultSpeed;
  }

  public reset() {
    this.obstacles = [];
    this.timeSinceLastSpawn = 0;
    this.speed = this.defaultSpeed;
    this.gapSize = this.defaultGapSize;
    this.spawnObstacle();
  }
}

interface Obstacle {
  x: number;
  gapY: number;
  passed: boolean;
}