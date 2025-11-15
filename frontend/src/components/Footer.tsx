"use client"

import { Github, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

const Footer = () => {
    return (
        <footer className="sm:px-30 px-4 flex gap-6 items-center flex-wrap justify-between py-3  bg-neutral-100">
            <div className="flex items-center gap-6">
                <Link className="text-sm leading-5 font-medium transition-colors hover:text-blue" href={"#"}>Company</Link>
                <Link className="text-sm leading-5 font-medium transition-colors hover:text-blue" href={"#"}>Resources</Link>
                <Link className="text-sm leading-5 font-medium transition-colors hover:text-blue" href={"#"}>Legal</Link>
            </div>
            <div className="flex items-center gap-6">
                <Link className=" transition-colors hover:text-blue" href={"https://www.linkedin.com/in/bogdan-tytysh-0b76b1290/"}><Linkedin size={20} />
                </Link>
                <Link className=" transition-colors hover:text-blue" href={"https://github.com/3cgbdg"}><Github size={20} />
                </Link>
            </div>
        </footer>
    )
}

export default Footer

