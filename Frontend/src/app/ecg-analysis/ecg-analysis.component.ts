import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeDocumentsService } from '../../analyzeDocuments.service';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

interface AnalysisResult {
  interpretation?: string;
  [key: string]: any; // Allow for other properties that might be returned
}

@Component({
  selector: 'app-ecg-analysis',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './ecg-analysis.component.html',
})
export class EcgAnalysisComponent {

 selectedFile: File | null = null;
  isAnalyzing: boolean = false;
  isDragOver: boolean = false;
  analysisResults: AnalysisResult | null = null;
  errorMessage: string | null = null;
  isOpen: boolean = false; // Dropdown for patient selection
  uploadProgress: number = 0;
uploadComplete: boolean = false;
 // Add this in your component

  constructor(private analyzeDocumentsService: AnalyzeDocumentsService) { }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }
  get progressPercentage(): number {
    return Math.round(this.uploadProgress);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }
  toggleDropdown(){
    this.isOpen = !this.isOpen; // Toggle the dropdown visibility
    console.log('Dropdown opened: ', this.isOpen);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isValidFile(file)) {
        this.selectedFile = file;
      } else {
        this.errorMessage = 'Please upload a valid file ( JPEG, or PNG - max 10MB).';
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.isValidFile(file)) {
        this.selectedFile = file;
        this.errorMessage = null;
      } else {
        this.errorMessage = 'Please upload a valid file ( JPEG, or PNG - max 10MB).';
        event.target.value = null; // Reset input
      }
    }
  }

  isValidFile(file: File): boolean {
    // Check if file is PDF, JPEG, or PNG and under 10MB
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  analyzeDocument(): void {
    if (!this.selectedFile) return;

    this.isAnalyzing = true;
    this.errorMessage = null;
    this.analysisResults = null;
    this.uploadProgress = 0;
    this.uploadComplete = false;

    const formData = new FormData();
    formData.append('ecg_image', this.selectedFile, this.selectedFile.name);

    // Simulate upload progress (0-50%)
    const totalSteps = 10;
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      this.uploadProgress = (currentStep / totalSteps) * 50; // First half for upload

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        // Start analysis simulation after upload completes
        this.simulateAnalysisProgress();
      }
    }, 300); // Update every 300ms for smoother progress

    this.analyzeDocumentsService.EcgAnalysis(formData).subscribe({
      next: (event: { done: boolean; body: any }) => {
      if (event.done) {
        // When analysis is complete
        this.uploadProgress = 100;
        setTimeout(() => {
        this.isAnalyzing = false;
        this.uploadComplete = true;
        const response: any = event.body;

        if (response && typeof response === 'object') {
          this.analysisResults = this.normalizeResults(response);
        } else {
          this.errorMessage = 'Received an unexpected response format from the server.';
        }
        }, 500); // Small delay to show 100% before hiding progress
      }
      },
      error: (error: { message?: string }) => {
      clearInterval(progressInterval);
      this.isAnalyzing = false;
      this.errorMessage = error.message || 'An error occurred during document analysis. Please try again.';
      }
    });
  }

  private simulateAnalysisProgress(): void {
    // Already at 50% from upload, now simulate analysis progress (50-99%)
    const analysisSteps = 10;
    let currentStep = 0;
    const analysisInterval = setInterval(() => {
      currentStep++;
      this.uploadProgress = 50 + (currentStep / analysisSteps) * 49; // Up to 99%

      if (currentStep >= analysisSteps) {
        clearInterval(analysisInterval);
      }
    }, 500); // Slightly slower updates for analysis phase
  }
  // Normalize different response formats into a consistent structure
  normalizeResults(response: any): AnalysisResult {
    const result: AnalysisResult = {};

    // If the response is empty or null
    if (!response) {
      return { message: 'No results returned from analysis.' };
    }

    if (Object.keys(result).length === 0) {
      result['rawOutput'] = response;
    }

    return result;
  }

  getFormattedResults(): string {
    if (!this.analysisResults) return '';
    console.log(this.analysisResults);

    if (this.analysisResults['rawOutput']) {
      if (typeof this.analysisResults['rawOutput'] === 'string') {

        return this.analysisResults['rawOutput'];
      } else {
        return this.analysisResults['rawOutput'].interpretation;

      }
    }

    return JSON.stringify(this.analysisResults, null, 2);

  }

  resetAnalysis(): void {
    this.selectedFile = null;
    this.analysisResults = null;
    this.errorMessage = null;
  }

}
