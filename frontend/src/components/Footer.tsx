"use client"

import { Github, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

const Footer = () => {
    return (
        <footer className="px-30 flex items-center justify-between py-3 h-14 bg-neutral-100">
            <div className="flex items-center gap-6">
                <Link className="text-sm leading-5 font-medium transition-colors hover:text-blue" href={"#"}>Company</Link>
                <Link className="text-sm leading-5 font-medium transition-colors hover:text-blue" href={"#"}>Resources</Link>
                <Link className="text-sm leading-5 font-medium transition-colors hover:text-blue" href={"#"}>Legal</Link>
            </div>
            <div className="flex items-center gap-6">
                <Link className=" transition-colors hover:text-blue" href={"#"}><Twitter size={20} />
                </Link>
                <Link className=" transition-colors hover:text-blue" href={"#"}><Linkedin size={20} />
                </Link>
                <Link className=" transition-colors hover:text-blue" href={"#"}><Github size={20} />
                </Link>
            </div>
        </footer>
    )
}

export default Footer

