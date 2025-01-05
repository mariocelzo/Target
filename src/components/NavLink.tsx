import Link from 'next/link';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
    return (
        <Link href={href}>
            <a className="text-white hover:text-gray-200 transition-all duration-200">
                {children}
            </a>
        </Link>
    );
}