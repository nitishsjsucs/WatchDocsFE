import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Play, AlertCircle, CheckCircle, ExternalLink, Link2, ShieldAlert, Clock, Trash2, Plus, Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { isHttpUrl, getDomainFromUrl } from '@/lib/validation';
import { addWatch, getWatches, deleteWatch } from '@/lib/storage';
import { WatchItem, PreviewStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function NewWatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('invalid');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [recentWatches, setRecentWatches] = useState<WatchItem[]>([]);

  // Load recent watches
  useEffect(() => {
    const loadWatches = async () => {
      const watches = await getWatches();
      setRecentWatches(watches.slice(0, 6));
    };
    loadWatches();
  }, []);

  // Validate URL on change
  useEffect(() => {
    if (url.trim()) {
      const isValid = isHttpUrl(url.trim());
      setPreviewStatus(isValid ? 'valid' : 'invalid');
      setUrlError(isValid ? '' : 'Please enter a valid URL starting with http:// or https://');
    } else {
      setPreviewStatus('invalid');
      setUrlError('');
    }
  }, [url]);

  const handlePreview = async () => {
    if (!isHttpUrl(url.trim())) return;
    
    setIsLoading(true);
    setPreviewStatus('loading');
    
    // Simulate loading time
    setTimeout(() => {
      setPreviewStatus('valid');
      setIsLoading(false);
    }, 1500);
  };

  const handleStartWatching = async () => {
    if (!isHttpUrl(url.trim())) return;

    const domain = getDomainFromUrl(url.trim());
    toast({
      title: "Starting to watch",
      description: domain,
    });
    
    // Navigate directly to WatchPage with URL as a parameter
    navigate(`/watch/preview/live?url=${encodeURIComponent(url.trim())}`);
  };

  const handleDeleteWatch = async (id: number) => {
    const success = await deleteWatch(id);
    if (success) {
      const watches = await getWatches();
      setRecentWatches(watches.slice(0, 6));
      toast({
        title: "Deleted",
        description: "Watch has been removed",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete watch",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getHealthIndicator = (watch: WatchItem) => {
    const { latest_scan } = watch;
    if (!latest_scan) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        text: 'No scan',
        description: 'No scans available yet'
      };
    }

    if (latest_scan.changes) {
      const level = latest_scan.change_level?.toLowerCase();
      if (level === 'major' || level === 'high') {
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          text: 'Major changes',
          description: latest_scan.change_summary || 'Major changes detected'
        };
      } else if (level === 'moderate' || level === 'medium') {
        return {
          icon: <Activity className="h-4 w-4" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          text: 'Moderate changes',
          description: latest_scan.change_summary || 'Moderate changes detected'
        };
      } else {
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          text: 'Minor changes',
          description: latest_scan.change_summary || 'Minor changes detected'
        };
      }
    } else {
      return {
        icon: <Shield className="h-4 w-4" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        text: 'Stable',
        description: 'No changes detected'
      };
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = () => {
    switch (previewStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (previewStatus) {
      case 'valid':
        return 'Valid';
      case 'invalid':
        return 'Invalid';
      case 'loading':
        return 'Loading...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'url(https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.05&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23dbf8ff&color2=%23ffffff&color3=%23dbf8ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uDensity=1&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0.2&wireframe=false)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Blur and Noise Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.1,
        }}
      />
      
      {/* Hero Section */}
      <div className="relative min-h-[80vh] p-4 sm:p-6 lg:p-8 z-10 flex flex-col justify-center">
        {/* Account Section - Top Right */}
        <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-xl flex items-center justify-center animate-scale-in">
            <Eye className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
          </div>
        </div>

        {/* Professional Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">
            Watch Docs
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-2xl mx-auto mb-4">
            Monitor web page changes with intelligent tracking and real-time notifications.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Secure scanning</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <span>Change detection</span>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-16 max-w-7xl mx-auto w-full">
          {/* Left Section - Form */}
          <div className={`w-full animate-fade-in-up transition-all duration-500 ${url.trim() ? 'lg:max-w-2xl' : 'lg:max-w-3xl mx-auto text-center'}`}>
            {/* URL Input Section */}
            <div className="space-y-6 mb-12">
              <div className="relative max-w-4xl mx-auto">
                <Link2 className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
                 <Input
                   id="url"
                   type="url"
                   placeholder="Enter any website URL (e.g., https://docs.example.com, https://news.site.com)"
                   value={url}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                   className={`pl-16 pr-6 h-16 sm:h-18 lg:h-20 text-lg sm:text-xl lg:text-2xl bg-white/95 backdrop-blur-sm border-2 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl placeholder:text-muted-foreground/50 ${urlError ? 'border-destructive focus-visible:ring-destructive' : 'border-border focus-visible:ring-primary focus:border-primary/50'}`}
                   aria-describedby={urlError ? 'url-error' : undefined}
                   aria-invalid={!!urlError}
                 />
                 {url.trim() && (
                   <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                     {getStatusIcon()}
                   </div>
                 )}
              </div>
              {urlError && (
                <Alert variant="destructive" className="animate-slide-down max-w-4xl mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id="url-error">
                    {urlError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-12 max-w-2xl mx-auto">
               <Button
                 onClick={handlePreview}
                 disabled={!isHttpUrl(url.trim()) || isLoading}
                 variant="outline"
                 size="lg"
                 className="flex-1 h-16 sm:h-18 text-lg font-medium bg-white/95 backdrop-blur-sm hover:bg-white border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
               >
                 <Eye className="h-5 w-5 mr-3" />
                 Preview Website
               </Button>
               <Button
                 onClick={handleStartWatching}
                 disabled={!isHttpUrl(url.trim())}
                 size="lg"
                 className="flex-1 h-16 sm:h-18 text-lg font-medium bg-black hover:bg-black/90 text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
               >
                 <Play className="h-5 w-5 mr-3" />
                 Start Monitoring
               </Button>
            </div>

            {/* Status and Help Text */}
            <div className="space-y-4 text-center">
              {url.trim() && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  {getStatusIcon()}
                  <span className={`font-medium ${previewStatus === 'valid' ? 'text-green-600' : previewStatus === 'invalid' ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {getStatusText()} URL
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Enter any website URL to start monitoring. We'll track changes and notify you when content updates.
              </p>
            </div>
          </div>

          {/* Right Section - Preview */}
          {url.trim() && (
            <div className="w-full lg:max-w-3xl animate-slide-in-right transition-all duration-700">
              <Card className="rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-border shadow-xl modern-hover">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      </div>
                      <span className="font-mono text-base text-muted-foreground">{getDomainFromUrl(url)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 rounded-2xl overflow-hidden aspect-video bg-muted/10 shadow-inner">
                    {isLoading ? (
                      <div className="p-8 space-y-4 h-full flex flex-col justify-center">
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                      </div>
                    ) : previewStatus === 'valid' ? (
                      <iframe
                        src={url}
                        className="w-full h-full"
                        sandbox="allow-same-origin allow-scripts"
                        title="Website preview"
                        onError={() => setPreviewStatus('blocked')}
                      />
                    ) : (
                      <div className="p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                        <ShieldAlert className="h-20 w-20 mx-auto mb-6 opacity-40" />
                        <p className="mb-6 text-base">
                          {previewStatus === 'invalid' 
                            ? 'Enter a valid URL to see the preview'
                            : 'Preview blocked by website security policy'
                          }
                        </p>
                         <Button
                           variant="outline"
                           size="lg"
                           onClick={() => window.open(url, '_blank')}
                           className="bg-white/95 backdrop-blur-sm hover:bg-white border-2 hover:border-primary/30 transition-all duration-300"
                         >
                           <ExternalLink className="h-5 w-5 mr-2" />
                           Open in new tab
                         </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Recent Watch Docs Section - Moved higher and improved */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Your Watch Dashboard</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Monitor all your tracked websites in one place. Get instant notifications when content changes.
            </p>
          </div>

          {recentWatches.length === 0 ? (
             <Card className="rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-border animate-fade-in-up shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/5 rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-primary/60" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to start monitoring?</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                  Add your first website above to begin tracking changes with intelligent notifications and detailed analysis.
                </p>
                 <Button 
                   size="lg"
                   onClick={() => document.getElementById('url')?.focus()}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                 >
                   <Plus className="h-5 w-5 mr-2" />
                   Get started now
                 </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-foreground">Active Monitors</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-medium">
                    {recentWatches.length} {recentWatches.length === 1 ? 'site' : 'sites'}
                  </Badge>
                </div>
                <Button variant="outline" className="bg-white/95 backdrop-blur-sm hover:bg-white border-2 hover:border-primary/30 transition-all duration-300">
                  <Activity className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentWatches.map((watch, index) => {
                const healthIndicator = getHealthIndicator(watch);
                return (
                  <TooltipProvider key={watch.id}>
                    <Card 
                      className="rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-border animate-fade-in-up modern-hover cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/watch/${watch.id}/timeline`)}
                    >
                      {/* Website Preview */}
                      <div className="relative h-32 bg-muted/20 overflow-hidden">
                        <iframe
                          src={watch.url}
                          className="w-full h-full transform scale-75 origin-top-left pointer-events-none"
                          sandbox="allow-same-origin"
                          title={`Preview of ${watch.title || getDomainFromUrl(watch.url)}`}
                          style={{
                            width: '133.33%',
                            height: '133.33%',
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge 
                            variant={getStatusBadgeVariant(watch.status)}
                            className="text-xs bg-white/90 backdrop-blur-sm"
                          >
                            {watch.status || 'Active'}
                          </Badge>
                        </div>

                        {/* Health Indicator */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`absolute top-2 right-2 ${healthIndicator.bgColor} ${healthIndicator.color} p-2 rounded-full backdrop-blur-sm`}>
                              {healthIndicator.icon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{healthIndicator.text}</p>
                            <p className="text-xs text-muted-foreground">{healthIndicator.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {/* Title and URL */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                            <h3 className="font-semibold text-base truncate text-foreground">
                              {watch.title || getDomainFromUrl(watch.url)}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground truncate pl-5">
                            {getDomainFromUrl(watch.url)}
                          </p>
                        </div>

                        {/* Health Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${healthIndicator.color.replace('text-', 'bg-')}`} />
                            <span className="text-sm font-medium">{healthIndicator.text}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {watch.latest_scan ? formatTimeAgo(watch.latest_scan.scan_date) : formatTimeAgo(watch.created_date)}
                          </div>
                        </div>

                        {/* Change Summary */}
                        {watch.latest_scan?.change_summary && (
                          <div className="text-xs text-muted-foreground pl-4 border-l-2 border-muted overflow-hidden">
                            <div 
                              className="line-clamp-2"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {watch.latest_scan.change_summary}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/watch/${watch.id}/live`);
                                  }}
                                  className="h-8 px-3 text-xs bg-white/90 backdrop-blur-sm hover:bg-white/95"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Live
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View live monitoring</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(watch.url, '_blank');
                                  }}
                                  className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white/95"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open website</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-white/90 backdrop-blur-sm hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete watch</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Watch</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{watch.title || getDomainFromUrl(watch.url)}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/90 backdrop-blur-sm hover:bg-white/95">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteWatch(watch.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipProvider>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
