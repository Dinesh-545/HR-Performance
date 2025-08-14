import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { ApiService } from '../../services/api.service';
import { Skill, Employee, EmployeeSkill } from '../../models/employee';
import { SkillDialogComponent } from '../dialogs/skill-dialog/skill-dialog.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatOptionModule
  ],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  employees: Employee[] = [];
  employeeSkills: EmployeeSkill[] = [];
  filteredSkills: Skill[] = [];
  loading = true;
  searchTerm = '';
  displayedColumns: string[] = ['id', 'name', 'description', 'employees', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSkills();
    this.loadEmployees();
  }

  loadSkills(): void {
    this.loading = true;
    console.log('Loading skills...');
    this.apiService.getSkills().subscribe({
      next: (skills) => {
        console.log('Skills loaded successfully:', skills.length);
        this.skills = skills;
        this.filteredSkills = skills;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.loading = false;
        this.showSnackBar('Error loading skills', 'error');
      }
    });
  }

  loadEmployees(): void {
    this.apiService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  filterSkills(): void {
    this.filteredSkills = this.skills.filter(skill => {
      const matchesSearch = !this.searchTerm || 
        skill.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.filterSkills();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterSkills();
  }

  openAddSkillDialog(): void {
    const dialogRef = this.dialog.open(SkillDialogComponent, {
      width: '500px',
      data: {
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.skills.unshift(result);
        this.filterSkills();
        this.showSnackBar('Skill added successfully', 'success');
      }
    });
  }

  openEditSkillDialog(skill: Skill): void {
    const dialogRef = this.dialog.open(SkillDialogComponent, {
      width: '500px',
      data: {
        skill: skill,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.skills.findIndex(s => (s.Id || s.id) === (result.Id || result.id));
        if (index !== -1) {
          this.skills[index] = result;
          this.filterSkills();
          this.showSnackBar('Skill updated successfully', 'success');
        }
      }
    });
  }

  deleteSkill(skill: Skill): void {
    if (confirm(`Are you sure you want to delete the skill "${skill.name}"?`)) {
      this.apiService.deleteSkill(skill.id).subscribe({
        next: () => {
          this.skills = this.skills.filter(s => (s.Id || s.id) !== (skill.Id || skill.id));
          this.filterSkills();
          this.showSnackBar('Skill deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting skill:', error);
          this.showSnackBar('Error deleting skill', 'error');
        }
      });
    }
  }

  getEmployeeCount(skillId: number): number {
    // TODO: Implement employee count for skills
    return 0;
  }

  getAverageSkillsPerEmployee(): number {
    if (this.employees.length === 0) return 0;
    // TODO: Calculate actual average skills per employee
    return Math.round(this.skills.length / this.employees.length);
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
} 