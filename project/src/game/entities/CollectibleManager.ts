export class CollectibleManager {
  private collectibles: Collectible[] = [];
  private canvas: HTMLCanvasElement;
  private spawnInterval: number = 5;
  private timeSinceLastSpawn: number = 0;
  private speed: number = 300;
  private types = ['zyn', 'bar', 'monster'];
  private colors = {
    zyn: '#FF4081',
    bar: '#00BCD4',
    monster: '#8BC34A',
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public update(deltaTime: number) {
    this.timeSinceLastSpawn += deltaTime;
    if (this.timeSinceLastSpawn > this.spawnInterval) {
      this.spawnCollectible();
      this.timeSinceLastSpawn = 0;
    }

    this.collectibles = this.collectibles.filter((collectible) => {
      collectible.x -= this.speed * deltaTime;
      return collectible.x + 30 > 0;
    });
  }

  private spawnCollectible() {
    const type = this.types[Math.floor(Math.random() * this.types.length)];
    const y = Math.random() * (this.canvas.height - 100) + 50;

    this.collectibles.push({
      x: this.canvas.width,
      y,
      type,
      collected: false,
      rotation: 0,
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.collectibles.forEach((collectible) => {
      if (collectible.collected) return;

      collectible.rotation += 0.02;

      ctx.save();
      ctx.translate(collectible.x, collectible.y);
      ctx.rotate(collectible.rotation);

      // Draw collectible
      ctx.fillStyle = this.colors[collectible.type as keyof typeof this.colors];
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Add shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(-5, -5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  public checkCollision(bird: any) {
    const birdBounds = bird.getBounds();
    
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;

      const dx = (birdBounds.x + birdBounds.width / 2) - collectible.x;
      const dy = (birdBounds.y + birdBounds.height / 2) - collectible.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 30) {
        collectible.collected = true;
        return collectible.type;
      }
    }

    return null;
  }

  public reset() {
    this.collectibles = [];
    this.timeSinceLastSpawn = 0;
  }
}

interface Collectible {
  x: number;
  y: number;
  type: string;
  collected: boolean;
  rotation: number;
}