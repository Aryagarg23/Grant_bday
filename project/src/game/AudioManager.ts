export class AudioManager {
  private audioContext: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};
  private isMuted: boolean = false;

  constructor() {
    this.audioContext = new AudioContext();
    this.loadSounds();
  }

  private async loadSounds() {
    const soundUrls = {
      flap: 'https://assets.codepen.io/385126/flap.mp3',
      score: 'https://assets.codepen.io/385126/score.mp3',
      gameOver: 'https://assets.codepen.io/385126/game-over.mp3',
      win: 'https://assets.codepen.io/385126/win.mp3',
    };

    for (const [name, url] of Object.entries(soundUrls)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.sounds[name] = await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error(`Failed to load sound: ${name}`, error);
      }
    }
  }

  private playSound(name: string) {
    if (this.isMuted || !this.sounds[name]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.audioContext.destination);
    source.start();
  }

  public playFlap() {
    this.playSound('flap');
  }

  public playScore() {
    this.playSound('score');
  }

  public playGameOver() {
    this.playSound('gameOver');
  }

  public playWin() {
    this.playSound('win');
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }
}