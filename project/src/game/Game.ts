import * as THREE from 'three';
import { Bird } from './entities/Bird';
import { ObstacleManager } from './entities/ObstacleManager';
import { CollectibleManager } from './entities/CollectibleManager';
import { AudioManager } from './AudioManager';
import { WinEffect } from './effects/WinEffect';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bird: Bird;
  private obstacleManager: ObstacleManager;
  private collectibleManager: CollectibleManager;
  private audioManager: AudioManager;
  private winEffect: WinEffect;
  private score: number = 0;
  private isGameOver: boolean = false;
  private animationFrameId: number = 0;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, threeCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.handleResize();

    this.bird = new Bird(canvas.width / 3, canvas.height / 2);
    this.obstacleManager = new ObstacleManager(canvas);
    this.collectibleManager = new CollectibleManager(canvas);
    this.audioManager = new AudioManager();
    this.winEffect = new WinEffect(threeCanvas);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    const handleInput = (e: Event) => {
      e.preventDefault();
      if (this.isGameOver) {
        this.restart();
      } else {
        this.bird.flap();
        this.audioManager.playFlap();
      }
    };

    this.canvas.addEventListener('click', handleInput);
    this.canvas.addEventListener('touchstart', handleInput);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') handleInput(e);
    });
  }

  public handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private update(deltaTime: number) {
    if (this.isGameOver) return;

    // Check if bird hits canvas boundaries
    const birdBounds = this.bird.getBounds();
    if (birdBounds.y <= 0 || birdBounds.y + birdBounds.height >= this.canvas.height) {
      this.gameOver();
      return;
    }

    this.bird.update(deltaTime);
    this.obstacleManager.update(deltaTime);
    this.collectibleManager.update(deltaTime);

    // Check collisions
    if (this.obstacleManager.checkCollision(this.bird)) {
      this.gameOver();
      return;
    }

    // Check score
    if (this.obstacleManager.checkScore(this.bird)) {
      this.score++;
      this.audioManager.playScore();

      if (this.score >= 23) {
        this.win();
      }
    }

    // Check collectibles
    const collectible = this.collectibleManager.checkCollision(this.bird);
    if (collectible) {
      this.handleCollectible(collectible);
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.obstacleManager.render(this.ctx);
    this.collectibleManager.render(this.ctx);
    this.bird.render(this.ctx);

    // Render score
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 60);

    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 64px Arial';
      this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
  }

  private gameLoop = (timestamp: number) => {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();
    this.winEffect.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private handleCollectible(type: string) {
    switch (type) {
      case 'zyn':
      case 'bar':
        this.obstacleManager.increaseGap();
        setTimeout(() => this.obstacleManager.resetGap(), 5000);
        break;
      case 'monster':
        this.obstacleManager.increaseSpeed();
        setTimeout(() => this.obstacleManager.resetSpeed(), 5000);
        break;
    }
  }

  private gameOver() {
    if (this.isGameOver) return; // Prevent multiple game over calls
    this.isGameOver = true;
    this.audioManager.playGameOver();
    cancelAnimationFrame(this.animationFrameId);
  }

  private win() {
    this.winEffect.show();
    this.audioManager.playWin();
  }

  public restart() {
    this.score = 0;
    this.isGameOver = false;
    this.bird.reset();
    this.obstacleManager.reset();
    this.collectibleManager.reset();
    this.winEffect.hide();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  public start() {
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  public cleanup() {
    cancelAnimationFrame(this.animationFrameId);
    this.winEffect.cleanup();
  }
}