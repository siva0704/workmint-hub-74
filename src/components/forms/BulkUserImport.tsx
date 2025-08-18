
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { parseCSVFile, parseCSVUsers, generateCSVTemplate } from '@/utils/csvImport';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';

interface BulkUserImportProps {
  onUsersImported: (users: User[]) => void;
  children: React.ReactNode;
}

export const BulkUserImport = ({ onUsersImported, children }: BulkUserImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    users: User[];
    errors: string[];
    totalProcessed: number;
  } | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuthStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const csvContent = await parseCSVFile(file);
      const result = parseCSVUsers(csvContent, user?.tenantId || '');
      
      setImportResult(result);
      
      if (result.success && result.users.length > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.users.length} users`,
        });
      } else if (result.errors.length > 0) {
        toast({
          title: 'Import Issues',
          description: `Found ${result.errors.length} errors. Please review and fix.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Failed to process CSV file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (importResult?.users) {
      onUsersImported(importResult.users);
      toast({
        title: 'Users Added',
        description: `${importResult.users.length} users have been added to your factory`,
      });
      setIsOpen(false);
      setImportResult(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Import Users
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Import Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Download the CSV template to ensure correct format</p>
                <p>2. Fill in user details (name, mobile, role are required; email is optional)</p>
                <p>3. Valid roles: factory_admin, supervisor, employee</p>
                <p>4. Upload your completed CSV file</p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Choose CSV file to upload</p>
                  <p className="text-xs text-muted-foreground">Supported format: .csv</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {isProcessing && (
                  <p className="text-sm text-muted-foreground mt-2">Processing file...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{importResult.users.length}</p>
                    <p className="text-sm text-muted-foreground">Valid Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Errors found:</p>
                        <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="text-red-600">• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.users.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Users to be imported:</p>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {importResult.users.map((user, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.mobile}</p>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.success && importResult.users.length > 0 && (
                  <Button onClick={handleConfirmImport} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Import {importResult.users.length} Users
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
