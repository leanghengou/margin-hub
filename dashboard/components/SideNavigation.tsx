import Link from "next/link";

export default async function SideNavigation() {



  return (
    <section className="text-white flex flex-col"> 
    <Link className="py-2" href="/">Home</Link>
    <Link className="py-2" href="/team">Team</Link>
    </section>
  );
}