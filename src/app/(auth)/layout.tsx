import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="GaranTech"
          width={220}
          height={60}
          className="h-14 w-auto object-contain"
          priority
        />
        <p className="text-sm text-white/50 mt-3 text-center font-medium">
          Gestión de garantías para tu tienda
        </p>
      </div>
      {children}
    </div>
  );
}
