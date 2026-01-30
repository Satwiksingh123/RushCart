import { useState } from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReportProductDialogProps {
  productId: string;
  productName: string;
}

type IssueType = 'expired' | 'damaged' | 'mrp_mismatch' | 'fake_offer' | 'other';

const issueTypeLabels: Record<IssueType, string> = {
  expired: 'Expired Product',
  damaged: 'Used / Damaged',
  mrp_mismatch: 'MRP Mismatch',
  fake_offer: 'Fake Offer',
  other: 'Other Issue',
};

const issueTypePoints: Record<IssueType, number> = {
  expired: 50,
  damaged: 40,
  mrp_mismatch: 30,
  fake_offer: 25,
  other: 20,
};

export default function ReportProductDialog({ productId, productName }: ReportProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [description, setDescription] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [expiryImage, setExpiryImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofImage(e.target.files[0]);
    }
  };

  const handleExpiryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExpiryImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-reports')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('product-reports')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!issueType) {
      toast({
        title: 'Error',
        description: 'Please select an issue type',
        variant: 'destructive',
      });
      return;
    }

    if (issueType === 'expired' && !expiryImage) {
      toast({
        title: 'Error',
        description: 'Expiry date photo is required for expired products',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to report issues',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let proofImageUrl: string | null = null;
      let expiryImageUrl: string | null = null;

      // Upload proof image if provided
      if (proofImage) {
        proofImageUrl = await uploadImage(proofImage, 'proof');
        if (!proofImageUrl) {
          throw new Error('Failed to upload proof image');
        }
      }

      // Upload expiry image if provided
      if (expiryImage) {
        expiryImageUrl = await uploadImage(expiryImage, 'expiry');
        if (!expiryImageUrl) {
          throw new Error('Failed to upload expiry date image');
        }
      }

      // Submit report to database
      const { error } = await supabase.from('product_reports').insert({
        user_id: user.id,
        product_id: productId,
        issue_type: issueType,
        description: description || null,
        proof_image_url: proofImageUrl,
        expiry_date_image_url: expiryImageUrl,
      });

      if (error) {
        if (error.message.includes('already reported')) {
          throw new Error('You have already reported this product today');
        }
        throw error;
      }

      toast({
        title: 'Report Submitted! 🎉',
        description: `Your report is under review. You'll earn ${issueTypePoints[issueType]} RushPoints once verified!`,
      });

      // Reset form
      setIssueType('');
      setDescription('');
      setProofImage(null);
      setExpiryImage(null);
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🚨 Report Product Issue</DialogTitle>
          <DialogDescription>
            Report issues with <strong>{productName}</strong> and earn RushPoints when verified!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Issue Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue Type *</Label>
            <Select value={issueType} onValueChange={(value) => setIssueType(value as IssueType)}>
              <SelectTrigger id="issue-type">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(issueTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label} (+{issueTypePoints[value as IssueType]} points)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Proof Image Upload */}
          <div className="space-y-2">
            <Label>Product Photo (Optional)</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleProofImageChange}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload">
                <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    {proofImage ? 'Change Photo' : 'Upload Photo'}
                  </span>
                </Button>
              </label>
              {proofImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate max-w-[150px]">{proofImage.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setProofImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Expiry Date Image Upload (Required for expired) */}
          <div className="space-y-2">
            <Label>
              Expiry Date Photo {issueType === 'expired' && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleExpiryImageChange}
                className="hidden"
                id="expiry-upload"
              />
              <label htmlFor="expiry-upload">
                <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    {expiryImage ? 'Change Photo' : 'Upload Photo'}
                  </span>
                </Button>
              </label>
              {expiryImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate max-w-[150px]">{expiryImage.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpiryImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {issueType === 'expired' && (
              <p className="text-xs text-muted-foreground">
                Clear photo of expiry date is required for verification
              </p>
            )}
          </div>

          {/* Points Preview */}
          {issueType && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm font-medium">
                🎁 You'll earn <strong>{issueTypePoints[issueType]} RushPoints</strong> once verified!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            ⚠️ You can report the same product only once per day
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
