import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, TrendingUp, Clock, Award, ChevronRight, Camera, Keyboard, Image as ImageIcon, AlertCircle, Upload, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ImageBarcodeScanner } from '@/components/ImageBarcodeScanner';
import { ManualBarcodeInput } from '@/components/ManualBarcodeInput';

interface UserPoints {
  total_points: number;
  points_used: number;
  available_points: number;
}

interface PointTransaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface Product {
  id: string;
  barcode: string;
  name: string;
  weight: string;
  price: number;
  image_url: string | null;
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

export default function Points() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueType | ''>('');
  const [description, setDescription] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [expiryImage, setExpiryImage] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'image'>('camera');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchPointsData();
  }, [user, navigate]);

  const fetchPointsData = async () => {
    if (!user) return;

    try {
      // Fetch user points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        throw pointsError;
      }

      setUserPoints(pointsData || { total_points: 0, points_used: 0, available_points: 0 });

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;

      setTransactions(transactionsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load points data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const lookupProduct = useCallback(async (barcode: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const product: Product = {
          id: data.id,
          barcode: data.barcode,
          name: data.name,
          weight: data.weight,
          price: Number(data.price),
          image_url: data.image_url,
        };
        setScannedProduct(product);
        setShowCamera(false);
      } else {
        toast({
          title: 'Product Not Found',
          description: `No product found with barcode: ${barcode}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error looking up product:', error);
      toast({
        title: 'Error',
        description: 'Failed to lookup product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

  const handleSubmitReport = async () => {
    if (!selectedIssue) {
      toast({
        title: 'Error',
        description: 'Please select an issue type',
        variant: 'destructive',
      });
      return;
    }

    if (selectedIssue === 'expired' && !expiryImage) {
      toast({
        title: 'Error',
        description: 'Expiry date photo is required for expired products',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !scannedProduct) {
      toast({
        title: 'Error',
        description: 'You must be logged in and have a product scanned',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

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
        product_id: scannedProduct.id,
        issue_type: selectedIssue,
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

      // Show success message
      setShowSuccess(true);
      
      // Refresh points data
      await fetchPointsData();

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setScannedProduct(null);
        setSelectedIssue('');
        setDescription('');
        setProofImage(null);
        setExpiryImage(null);
      }, 3000);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes('verified')) return <Award className="h-4 w-4 text-green-500" />;
    if (type.includes('redeemed')) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <Coins className="h-4 w-4 text-primary" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Coins className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your points...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Report Submitted! 🎉</h2>
          <p className="text-muted-foreground mb-4">
            Your report is under review by our staff.
          </p>
          <div className="bg-primary/10 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">You'll earn</p>
            <p className="text-3xl font-bold text-primary">
              +{selectedIssue ? issueTypePoints[selectedIssue] : 0} Points
            </p>
            <p className="text-xs text-muted-foreground mt-1">after verification</p>
          </div>
          <p className="text-sm text-muted-foreground">
            We'll notify you once your report is verified!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-9 w-9 rounded-lg hover:bg-white/10 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">RushPoints Wallet</h1>
            <p className="text-primary-foreground/80 text-sm">Earn points by reporting product issues!</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-foreground/70">Available Points</p>
            <p className="text-2xl font-bold">{userPoints?.available_points || 0}</p>
          </div>
          <Button size="sm" variant="secondary" className="gap-2">
            Redeem
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scanning Interface */}
      <div className="p-4">
        <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Report Product Issue
        </h2>

        {!scannedProduct ? (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Scan or enter barcode to report a product issue
            </p>
            
            <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="camera" className="gap-1">
                  <Camera className="h-4 w-4" />
                  <span className="text-xs">Scan</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-1">
                  <Keyboard className="h-4 w-4" />
                  <span className="text-xs">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-1">
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-xs">Image</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="mt-4">
                {showCamera ? (
                  <div className="space-y-2">
                    <BarcodeScanner onScan={lookupProduct} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCamera(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="w-full gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Start Camera Scanner
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <ManualBarcodeInput onSubmit={lookupProduct} />
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <ImageBarcodeScanner onScan={lookupProduct} />
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Scanned Product Display */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                {scannedProduct.image_url && (
                  <img
                    src={scannedProduct.image_url}
                    alt={scannedProduct.name}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{scannedProduct.name}</h3>
                  <p className="text-xs text-muted-foreground">{scannedProduct.weight}</p>
                  <p className="text-sm font-bold text-primary">₹{scannedProduct.price}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setScannedProduct(null);
                    setSelectedIssue('');
                    setDescription('');
                    setProofImage(null);
                    setExpiryImage(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Issue Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Issue Type *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(issueTypeLabels) as IssueType[]).map((type) => (
                    <Button
                      key={type}
                      variant={selectedIssue === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedIssue(type)}
                      className="justify-between h-auto py-2 px-3"
                    >
                      <span className="text-xs">{issueTypeLabels[type]}</span>
                      <Badge variant="secondary" className="text-xs">
                        +{issueTypePoints[type]}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedIssue && (
                <>
                  {/* Description */}
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Provide additional details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  {/* Proof Images */}
                  <div className="space-y-3 mt-4">
                    <Label className="text-sm font-medium">Upload Proof Photos</Label>
                    
                    {/* Product Proof Image */}
                    <div className="space-y-2">
                      <Label htmlFor="proof-image" className="text-xs text-muted-foreground">
                        Product Photo (Optional)
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="proof-image"
                          accept="image/*"
                          onChange={handleProofImageChange}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('proof-image')?.click()}
                          className="flex-1 gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {proofImage ? proofImage.name : 'Upload Product Photo'}
                        </Button>
                        {proofImage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProofImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expiry Date Image (Required for expired products) */}
                    {selectedIssue === 'expired' && (
                      <div className="space-y-2">
                        <Label htmlFor="expiry-image" className="text-xs text-muted-foreground">
                          Expiry Date Photo (Required) *
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="expiry-image"
                            accept="image/*"
                            onChange={handleExpiryImageChange}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('expiry-image')?.click()}
                            className="flex-1 gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            {expiryImage ? expiryImage.name : 'Upload Expiry Photo'}
                          </Button>
                          {expiryImage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpiryImage(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitReport}
                    disabled={submitting}
                    className="w-full mt-4 gap-2"
                  >
                    {submitting ? (
                      <>
                        <Coins className="h-4 w-4 animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Submit Report & Earn {issueTypePoints[selectedIssue]} Points
                      </>
                    )}
                  </Button>
                </>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Points Info */}
      <div className="p-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
              <p className="text-lg font-semibold text-green-600">
                +{userPoints?.total_points || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Used</p>
              <p className="text-lg font-semibold text-orange-600">
                -{userPoints?.points_used || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="p-4">
        <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Transaction History
        </h2>

        {transactions.length === 0 ? (
          <Card className="p-8 text-center border-0 ring-1 ring-border/50">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Start earning points by reporting product issues!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="p-4 flex items-center justify-between border-0 ring-1 ring-border/50 hover:ring-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-bold text-sm ${
                    transaction.points > 0 ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {transaction.points > 0 ? '+' : ''}
                  {transaction.points}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
