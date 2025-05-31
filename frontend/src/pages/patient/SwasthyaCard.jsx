import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { patientService } from '@/lib/api';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { Download, Share2, Undo2, RotateCw, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react'; // Make sure this is installed

const SwasthyaCard = () => {
  const { user } = useAuth();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0); // Track QR code rotation
  const [showQrFullscreen, setShowQrFullscreen] = useState(false); // For fullscreen QR display
  const cardRef = useRef(null);
  const frontCardRef = useRef(null); // Reference specifically for the front card
  const qrRef = useRef(null);
  
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        const response = await patientService.getSwasthyaCard();
        setCardData(response.data.data.swasthyaCard);
      } catch (error) {
        console.error('Error fetching Swasthya card:', error);
        toast.error('Failed to load Swasthya card data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCardData();
  }, []);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleDownloadCard = async () => {
    try {
      if (!frontCardRef.current) return;
      
      // Set downloading state
      setIsDownloading(true);
      
      // Create a clone of the front card for downloading
      const originalCard = frontCardRef.current;
      const cloneContainer = document.createElement('div');
      cloneContainer.style.position = 'absolute';
      cloneContainer.style.top = '-9999px';
      cloneContainer.style.left = '-9999px';
      cloneContainer.style.width = originalCard.offsetWidth + 'px';
      cloneContainer.style.height = originalCard.offsetHeight + 'px';
      
      // Clone the node
      const clone = originalCard.cloneNode(true);
      
      // Fix any styles that might interfere with proper rendering
      clone.style.transform = 'none';
      clone.style.transition = 'none';
      clone.style.backfaceVisibility = 'visible';
      clone.style.position = 'static';
      clone.classList.remove('backface-hidden', 'absolute', 'inset-0');
      
      // Ensure any QR Code related elements are not visible in the download
      const qrElements = clone.querySelectorAll('.qr-element');
      qrElements.forEach(el => {
        el.style.display = 'none';
      });
      
      // Add to DOM temporarily for rendering
      cloneContainer.appendChild(clone);
      document.body.appendChild(cloneContainer);
      
      // Use a short delay to ensure the DOM has updated
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(clone, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            onclone: (clonedDoc) => {
              // Additional opportunity to modify the clone right before rendering
              const clonedCard = clonedDoc.querySelector('.card-for-download');
              if (clonedCard) {
                clonedCard.style.transform = 'none';
              }
            }
          });
          
          const image = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = image;
          link.download = `swasthya-card-${cardData?.cardNumber || 'id'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the clone
          document.body.removeChild(cloneContainer);
          
          toast.success('Card downloaded successfully');
        } catch (error) {
          console.error('Error creating image:', error);
          toast.error('Failed to create card image');
          // Still clean up the clone on error
          if (document.body.contains(cloneContainer)) {
            document.body.removeChild(cloneContainer);
          }
        } finally {
          setIsDownloading(false);
        }
      }, 300);
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Failed to download card');
      setIsDownloading(false);
    }
  };
  
  const handleShareCard = async () => {
    try {
      if (!cardRef.current) return;
      
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: 'My Swasthya Card',
          text: `My Swasthya Card ID: ${cardData?.cardNumber || 'N/A'}`,
          url: window.location.href
        });
        toast.success('Card shared successfully');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      toast.error('Failed to share card');
    }
  };
  
  // Rotate QR code by 90 degrees
  const handleRotateQr = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
    
    // When rotated to 90 or 270 degrees, show prompt
    if (rotationAngle === 0 || rotationAngle === 180) {
      toast.info('QR code ready for scanning! Doctors can add medical information via this code.', {
        duration: 5000,
      });
    }
  };
  
  // Toggle fullscreen QR code view
  const toggleQrFullscreen = () => {
    setShowQrFullscreen(!showQrFullscreen);
    // Reset rotation when toggling
    if (!showQrFullscreen) {
      setRotationAngle(0);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  // Generate QR code data with additional context
  const qrCodeData = JSON.stringify({
    type: 'swasthya-card',
    patientId: user?.id,
    cardNumber: cardData?.cardNumber
  });
  
  // QR code URL for patient profile scan
  const qrCodeUrl = `${window.location.origin}/scan-patient/${user?.id}`;
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* <h1 className="mb-8 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Swasthya Health Card</h1> */}
      
      {/* New Alert about Swasthya ID lookup feature */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Important Privacy Information
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Anyone with your Swasthya ID can access your complete medical details through our lookup system. 
                Please share your ID only with trusted healthcare providers and individuals.
              </p>
              <div className="mt-3">
                <a
                  href="/lookup-patient"
                  className="text-amber-800 underline font-medium hover:text-amber-900"
                >
                  Try the Lookup Feature
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen QR code overlay */}
      {showQrFullscreen && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6">
          <div className="text-white text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Scan QR Code</h2>
            <p>Rotate if needed and allow a doctor to scan this code to add medical records or medications.</p>
          </div>
          
          <div 
            className="bg-white p-8 rounded-lg shadow-xl transition-transform duration-300 ease-in-out"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
            ref={qrRef}
          >
            <QRCode 
              value={qrCodeUrl}
              size={280}
              level="H"
              includeMargin={true}
              renderAs="svg"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={handleRotateQr}
              className="bg-white hover:bg-blue-50 border-blue-200"
            >
              <RotateCw className="mr-2 h-4 w-4 text-indigo-600" />
              Rotate
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleQrFullscreen}
              className="bg-white hover:bg-blue-50 border-blue-200"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 justify-center">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Card wrapper with perspective for 3D effect */}
          <div className="relative h-[500px] w-full perspective shadow-xl">
            {/* Flipable card container */}
            <div
              ref={cardRef}
              className={`relative h-full w-full duration-700 preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of the card */}
              <div className="absolute inset-0 backface-hidden card-for-download" ref={frontCardRef}>
                <Card className="h-full overflow-hidden flex flex-col shadow-lg border border-blue-100 rounded-xl">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white text-center">
                    <h2 className="text-2xl font-bold">Swasthya Health ID</h2>
                    <p className="text-sm opacity-90">Digital Health Card</p>
                  </div>
                  <CardContent className="mt-4 flex-1 overflow-y-auto">
                    <div className="mb-6 text-center">
                      <div className="mx-auto h-24 w-24 rounded-full overflow-hidden bg-gray-200 shadow-md border-2 border-indigo-100">
                        {user?.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-3xl font-bold">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-xl font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-indigo-600">{user?.email}</p>
                    </div>
                    
                    <div className="mb-6 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-indigo-800">Card Number:</span>
                        <span className="text-sm font-mono bg-white px-2 py-1 rounded shadow-sm border border-indigo-100 text-gray-800">
                          {cardData?.cardNumber || 'Not available'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-indigo-800">Issue Date:</span>
                        <span className="text-sm text-gray-800">
                          {cardData?.issueDate 
                            ? new Date(cardData.issueDate).toLocaleDateString() 
                            : 'Not available'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-indigo-800">Blood Group:</span>
                        <span className="text-sm font-bold text-white bg-red-600 px-2 py-1 rounded-full shadow-sm">
                          {cardData?.bloodGroup || 'Not available'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Emergency Contact Section - Redesigned */}
                    {cardData?.emergencyContact && (
                      <div className="mb-6 p-4 rounded-lg shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                        <h3 className="text-sm font-bold mb-2 text-amber-800">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          <div className="text-xs font-bold text-indigo-800">Name:</div>
                          <div className="text-xs text-gray-800">{cardData.emergencyContact.name || 'N/A'}</div>
                          
                          <div className="text-xs font-bold text-indigo-800">Relationship:</div>
                          <div className="text-xs text-gray-800">{cardData.emergencyContact.relationship || 'N/A'}</div>
                          
                          <div className="text-xs font-bold text-indigo-800">Phone:</div>
                          <div className="text-xs font-mono text-gray-800">{cardData.emergencyContact.phoneNumber || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                    
                    {cardData?.allergies && cardData.allergies.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-bold text-indigo-800 mb-2 block">Allergies:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {cardData.allergies.map((allergy, index) => (
                            <span 
                              key={index} 
                              className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 shadow-sm border border-red-200"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Back of the card */}
              <div className="absolute inset-0 rotate-y-180 backface-hidden">
                <Card className="h-full overflow-hidden flex flex-col shadow-lg border border-blue-100 rounded-xl">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white text-center">
                    <h2 className="text-2xl font-bold">QR Code</h2>
                    <p className="text-sm opacity-90">Scan for your health details</p>
                  </div>
                  <CardContent className="mt-4 flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div 
                      className="mb-6 p-4 bg-white rounded-lg shadow-lg transition-transform duration-300 ease-in-out border-2 border-indigo-100"
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                    >
                      <QRCode 
                        value={qrCodeUrl}
                        size={180}
                        level="H"
                        includeMargin={true}
                        renderAs="svg"
                      />
                    </div>
                    
                    <div className="text-center mb-6">
                      <h3 className="font-bold text-lg text-indigo-800">Swasthya Card ID</h3>
                      <p className="text-gray-700 font-mono">{cardData?.cardNumber}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center bg-white hover:bg-blue-50 border-blue-200 text-indigo-700" 
                        onClick={handleRotateQr}
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        Rotate QR Code
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center bg-white hover:bg-blue-50 border-blue-200 text-indigo-700" 
                        onClick={toggleQrFullscreen}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Fullscreen QR
                      </Button>
                    </div>
                    
                    <div className="text-center mt-6 text-sm text-indigo-700 bg-white p-3 rounded-lg shadow-sm border border-indigo-100 max-w-xs">
                      <p>Rotate this QR code and let doctors scan it to add medical information securely.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card options - now positioned to the right */}
        <div className="flex flex-row lg:flex-col justify-center gap-4 mt-6 lg:mt-0 lg:self-center">
          <Button
            variant="outline"
            onClick={handleFlip}
            disabled={isDownloading}
            className="bg-white hover:bg-blue-50 border-blue-200 text-indigo-700 px-5 py-2 shadow-sm flex-1 lg:flex-none"
          >
            {isFlipped ? <Undo2 className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
            {isFlipped ? 'View Card' : 'View QR Code'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownloadCard}
            disabled={isDownloading}
            className="bg-white hover:bg-blue-50 border-blue-200 text-indigo-700 px-5 py-2 shadow-sm flex-1 lg:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Save Card
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShareCard}
            disabled={isDownloading}
            className="bg-white hover:bg-blue-50 border-blue-200 text-indigo-700 px-5 py-2 shadow-sm flex-1 lg:flex-none"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwasthyaCard; 