export class Bird {
  private x: number;
  private y: number;
  private velocity: number = 0;
  private gravity: number = 800;
  private flapStrength: number = -400;
  private size: number = 30;
  private initialY: number;
  private rotation: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.initialY = y;
  }

  public update(deltaTime: number) {
    this.velocity += this.gravity * deltaTime;
    this.y += this.velocity * deltaTime;

    // Update rotation based on velocity
    const targetRotation = this.velocity > 0 ? 
      Math.min(Math.PI / 4, this.velocity / 1000) : 
      Math.max(-Math.PI / 4, this.velocity / 1000);
    this.rotation = targetRotation;
  }

  public flap() {
    this.velocity = this.flapStrength;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(
      -5,
      0,
      this.size / 2,
      this.size / 4,
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.size / 2, -this.size / 4, this.size / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public getBounds() {
    return {
      x: this.x - this.size,
      y: this.y - this.size,
      width: this.size * 2,
      height: this.size * 2,
    };
  }

  public reset() {
    this.y = this.initialY;
    this.velocity = 0;
    this.rotation = 0;
  }
}