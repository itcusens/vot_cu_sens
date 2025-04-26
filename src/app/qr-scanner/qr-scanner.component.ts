import { CommonModule } from '@angular/common';
import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {
  private html5QrCode!: Html5Qrcode;
  scanResult: string | null = null;
  errorMessage: string | null = null;
  results: { number: number; name: string }[][] = [];
  scannerRunning: boolean = false;

  ngAfterViewInit(): void {
    this.startScanner();
  }

  startScanner(): void {
    const cameraId = 'qr-scanner';
    this.html5QrCode = new Html5Qrcode(cameraId);

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const selectedDeviceId = devices[0].id;

        const config = {
          fps: 1,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: minEdge * 0.95, height: minEdge * 0.95 };
          },
          videoConstraints: {
            width: { ideal: 1520 },
            height: { ideal: 1080 }
          }
        };

        this.html5QrCode.start(
          selectedDeviceId,
          config,
          (decodedText) => {
            this.scanResult = decodedText;
            this.stopScanner();
          },
          (errorMessage) => {
            console.warn('QR scan error:', errorMessage);
          }
        ).then(() => {
          this.scannerRunning = true;
        }).catch((err) => {
          this.errorMessage = 'Unable to start QR scanner: ' + err;
          console.error(err);
        });
      } else {
        this.errorMessage = 'No camera devices found.';
      }
    }).catch((err) => {
      this.errorMessage = 'Error listing cameras: ' + err;
      console.error(err);
    });
  }

  stopScanner(): void {
    if (this.html5QrCode && this.scannerRunning) {
      this.html5QrCode.stop()
        .then(() => {
          this.scannerRunning = false;
          this.html5QrCode.clear();
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
        });
    }
  }

  parseScanResult(): { number: number; name: string }[] {
    try {
      return JSON.parse(this.scanResult || '[]');
    } catch (error) {
      console.error('Failed to parse scan result:', error);
      return [];
    }
  }

  rescan(): void {
    this.scanResult = null;

    if (this.html5QrCode && this.scannerRunning) {
      this.html5QrCode.stop()
        .then(() => {
          this.scannerRunning = false;
          this.html5QrCode.clear();
          this.startScanner();
        })
        .catch((err) => {
          console.error('Error stopping scanner on rescan:', err);
          this.html5QrCode.clear();
          this.startScanner();
        });
    } else {
      this.startScanner();
    }
  }

  saveResult(): void {
    if (this.scanResult) {
      const parsed = this.parseScanResult();
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.results.push(parsed);
      } else {
        console.error('Scan result is not in the expected format.');
      }
      this.scanResult = null;
      this.startScanner();
    }
  }

  downloadResultsAsCsv(): void {
    if (this.results.length === 0) {
      alert('No results to download.');
      return;
    }

    const maxPositions = this.results[0].length;
    const candidateNames = this.results[0].map((entry: any) => entry.name);
    const headerRow = ['Buletinul de vot', ...Array.from({ length: maxPositions }, (_, i) => i + 1)];

    const rows = candidateNames.map((candidate: string) => {
      const ranks = this.results.map((ballot: any) => {
        const candidatePosition = ballot.findIndex((entry: any) => entry.name === candidate);
        return candidatePosition !== -1 ? candidatePosition + 1 : '';
      });
      return [candidate, ...ranks];
    });

    const csvContent = [headerRow, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'rezultate_voturi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
