import { motion } from 'motion/react';
import { ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface HomePageProps {
  onStart: () => void;
}

export function HomePage({ onStart }: HomePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative flex items-center justify-center size-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-2xl">
              <ChefHat className="size-16 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
            <Sparkles className="size-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              Bem-vindo ao EatsFood
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Comida deliciosa,
            <br />
            na sua porta
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Descubra os melhores restaurantes da sua região e peça suas refeições favoritas com apenas alguns cliques
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl hover:shadow-2xl transition-all"
          >
            Quero Pedir
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">500+</p>
            <p className="text-sm text-muted-foreground">Restaurantes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">2k+</p>
            <p className="text-sm text-muted-foreground">Pratos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">50k+</p>
            <p className="text-sm text-muted-foreground">Pedidos</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}