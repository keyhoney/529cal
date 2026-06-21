export interface ResultCardData {
  semesterLabel: string;
  grade5: string;
  grade9: string;
  percentile: string;
  tier: string;
}

export function renderResultCardCanvas(data: ResultCardData): HTMLCanvasElement {
  const w = 600;
  const h = 760;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1a1a1e');
  bg.addColorStop(0.5, '#111113');
  bg.addColorStop(1, '#0a0a0c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, w * 0.6);
  glow.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, 24, 24, w - 48, h - 48, 20);
  ctx.stroke();

  ctx.fillStyle = '#f0d88a';
  ctx.font = 'bold 14px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('529CAL', w / 2, 72);

  ctx.fillStyle = '#f8f6f2';
  ctx.font = 'bold 28px Pretendard, sans-serif';
  ctx.fillText('내신 환산 결과', w / 2, 118);

  ctx.fillStyle = '#b0aca4';
  ctx.font = '16px Pretendard, sans-serif';
  ctx.fillText(data.semesterLabel, w / 2, 152);

  ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
  roundRect(ctx, 48, 188, w - 96, 88, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, 48, 188, w - 96, 88, 14);
  ctx.stroke();

  ctx.fillStyle = '#d4d0c8';
  ctx.font = '14px Pretendard, sans-serif';
  ctx.fillText('누적 백분위', w / 2, 222);
  ctx.fillStyle = '#fff8e8';
  ctx.font = 'bold 42px Pretendard, sans-serif';
  ctx.fillText(`상위 ${data.percentile}%`, w / 2, 262);

  ctx.fillStyle = '#f0d88a';
  ctx.font = 'bold 18px Pretendard, sans-serif';
  ctx.fillText(data.tier, w / 2, 310);

  const metrics = [
    { label: '5등급제', value: data.grade5 },
    { label: '9등급제', value: data.grade9 },
  ];
  const boxW = (w - 96 - 16) / 2;
  metrics.forEach((m, i) => {
    const x = 48 + i * (boxW + 16);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, x, 340, boxW, 100, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    roundRect(ctx, x, 340, boxW, 100, 12);
    ctx.stroke();
    ctx.fillStyle = '#a8a49c';
    ctx.font = '13px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, x + boxW / 2, 378);
    ctx.fillStyle = '#fff8e8';
    ctx.font = 'bold 32px Pretendard, sans-serif';
    ctx.fillText(m.value, x + boxW / 2, 418);
  });

  ctx.fillStyle = '#7a756c';
  ctx.font = '12px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('교육 상담·입시 참고용 추정치입니다', w / 2, h - 56);
  ctx.fillStyle = '#f0d88a';
  ctx.font = 'bold 13px Pretendard, sans-serif';
  ctx.fillText('529cal — 내신 환산 · 입결 조회', w / 2, h - 32);

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function shareCanvas(
  canvas: HTMLCanvasElement,
  shareData: { title: string; text: string; url: string },
): Promise<'shared' | 'copied' | 'downloaded'> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });

  if (blob && navigator.share) {
    try {
      const file = new File([blob], '529cal-result.png', { type: 'image/png' });
      const payload: ShareData = { title: shareData.title, text: shareData.text, url: shareData.url };
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ ...payload, files: [file] });
        return 'shared';
      }
      await navigator.share(payload);
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'copied';
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    return 'copied';
  }

  downloadCanvas(canvas, '529cal-result.png');
  return 'downloaded';
}
