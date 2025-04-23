import { CommonModule } from '@angular/common';
import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {
  private codeReader = new BrowserQRCodeReader();
  private controls: IScannerControls | null = null;

  scanResult: string | null = null;
  errorMessage: string | null = null;

  ngAfterViewInit(): void {
    this.startScanner();
  }

  startScanner(): void {
    BrowserQRCodeReader.listVideoInputDevices()
      .then((devices) => {
        if (devices.length === 0) {
          this.errorMessage = 'No camera devices found.';
          return;
        }

        const selectedDeviceId = devices[0].deviceId;
        const videoElement = document.getElementById('videoElement') as HTMLVideoElement;

        // ✅ Wait for the video to actually start playing
        navigator.mediaDevices
          .getUserMedia({ video: { deviceId: selectedDeviceId } })
          .then((stream) => {
            videoElement.srcObject = stream;
            videoElement.play();

            videoElement.onloadedmetadata = () => {
              console.log('Video ready, starting QR scanner...');
              this.decodeStream(selectedDeviceId);
            };
          })
          .catch((err) => {
            this.errorMessage = 'Error accessing camera: ' + err;
            console.error('Camera access error:', err);
          });
      })
      .catch((err) => {
        this.errorMessage = 'Error listing video devices: ' + err;
        console.error(err);
      });
  }

  private decodeStream(deviceId: string): void {
    this.codeReader.decodeFromVideoDevice(
      deviceId,
      'videoElement',
      (result: any, error: any, controls: IScannerControls) => {
        if (result) {
          this.scanResult = result.getText();
          console.log('QR Code Result:', this.scanResult);
          controls.stop(); // Stop after first successful detection
        }

        if (error && error.name !== 'NotFoundException') {
          this.errorMessage = 'Error scanning QR Code: ' + error.message;
          console.error('Scan error:', error);
        }

        this.controls = controls;
      }
    );
  }

  stopScanner(): void {
    if (this.controls) {
      this.controls.stop();
      this.controls = null;
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
    const videoElement = document.getElementById('videoElement') as HTMLVideoElement;
    if (videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  }
}
