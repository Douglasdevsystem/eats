import { AlertCircle, XCircle, CheckCircle, Info } from 'lucide-react';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export function AlertDialog({ open, onClose, title, message, type = 'warning' }: AlertDialogProps) {
  const config = {
    error: {
      icon: <XCircle className="size-12" />,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: <AlertCircle className="size-12" />,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    success: {
      icon: <CheckCircle className="size-12" />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    },
    info: {
      icon: <Info className="size-12" />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const currentConfig = config[type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden border-2 shadow-2xl">
        {/* Header colorido */}
        <div className={`${currentConfig.bgColor} ${currentConfig.borderColor} border-b-2 py-6 px-6`}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`${currentConfig.iconColor} drop-shadow-sm`}>
              {currentConfig.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6 bg-white">
          <p className="text-gray-700 text-center whitespace-pre-line leading-relaxed text-sm">
            {message}
          </p>
        </div>

        {/* Footer com botão */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <Button 
            onClick={onClose}
            className={`w-full h-11 ${currentConfig.buttonColor} text-white font-semibold shadow-md transition-all hover:shadow-lg`}
          >
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}