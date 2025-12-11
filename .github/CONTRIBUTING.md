# Contributing to Smart Pharmacy Inventory

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pharmacy-inventory.git
   cd pharmacy-inventory
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/pharmacy-inventory.git
   ```

## 💡 How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in Issues
- Use the bug report template
- Include steps to reproduce
- Include expected vs actual behavior
- Include screenshots if applicable

### Suggesting Features

- Check existing feature requests first
- Use the feature request template
- Describe the problem your feature solves
- Explain how your feature would work

### Code Contributions

1. Create a new branch for your feature/fix
2. Write clean, documented code
3. Add tests if applicable
4. Submit a pull request

## 🛠 Development Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
pip install -r requirements-dev.txt  # if available
```

### Frontend

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📝 Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints where possible
- Document functions with docstrings
- Maximum line length: 100 characters

```python
def calculate_stock_level(medicine_id: int, warehouse_id: int) -> int:
    """
    Calculate the current stock level for a medicine.
    
    Args:
        medicine_id: The ID of the medicine
        warehouse_id: The ID of the warehouse
        
    Returns:
        Current stock quantity
    """
    pass
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use functional components with hooks
- Follow React best practices

```typescript
interface Medicine {
  id: number;
  name: string;
  quantity: number;
  expiryDate: Date;
}

const MedicineCard: React.FC<{ medicine: Medicine }> = ({ medicine }) => {
  // Component implementation
};
```

## 📨 Commit Guidelines

Use conventional commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add medicine expiry notification system
fix: resolve stock calculation bug in dashboard
docs: update API documentation for inventory endpoints
```

## 🔄 Pull Request Process

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure your code passes all checks**:
   - Linting passes
   - Tests pass
   - No merge conflicts

3. **Create the Pull Request**:
   - Use a descriptive title
   - Reference any related issues
   - Describe what changes were made and why

4. **Review Process**:
   - Address any feedback from reviewers
   - Make requested changes
   - Once approved, your PR will be merged

## 🙏 Thank You!

Every contribution helps make this project better. We appreciate your time and effort!
