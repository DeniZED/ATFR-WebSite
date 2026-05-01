import { Link } from 'react-router-dom';
import { Camera, Map as MapIcon, Settings } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';
import { useGeoMaps, useGeoShots } from '@/features/geoguesser/queries';

export default function AdminGeoHome() {
  const maps = useGeoMaps();
  const shots = useGeoShots();
  const publishedShots = (shots.data ?? []).filter((s) => s.is_published).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Académie
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">GeoGuesser WoT</h1>
        <p className="text-sm text-atfr-fog mt-1">
          Devine la map et la position du screenshot. Administre la liste des
          maps (synchronisée depuis Wargaming) et les screenshots positionnés
          sur la minimap.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/geoguesser/maps">
          <Card className="hover:border-atfr-gold/40 transition-colors h-full">
            <CardBody className="p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg border border-atfr-gold/40 bg-atfr-ink/60 flex items-center justify-center text-atfr-gold shrink-0">
                <MapIcon size={22} strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl text-atfr-bone">Maps</p>
                <p className="text-xs text-atfr-fog mt-1">
                  {maps.data
                    ? `${maps.data.length} dans la base`
                    : 'Chargement…'}
                </p>
                <p className="text-sm text-atfr-fog mt-3">
                  Synchroniser depuis Wargaming, ajouter des maps custom,
                  activer/désactiver.
                </p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/admin/geoguesser/shots">
          <Card className="hover:border-atfr-gold/40 transition-colors h-full">
            <CardBody className="p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg border border-atfr-gold/40 bg-atfr-ink/60 flex items-center justify-center text-atfr-gold shrink-0">
                <Camera size={22} strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl text-atfr-bone">Screenshots</p>
                <p className="text-xs text-atfr-fog mt-1">
                  {shots.data
                    ? `${publishedShots} / ${shots.data.length} publié(s)`
                    : 'Chargement…'}
                </p>
                <p className="text-sm text-atfr-fog mt-3">
                  Uploader, associer à une map, placer le point sur la
                  minimap, publier.
                </p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/admin/geoguesser/settings">
          <Card className="hover:border-atfr-gold/40 transition-colors h-full">
            <CardBody className="p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg border border-atfr-gold/40 bg-atfr-ink/60 flex items-center justify-center text-atfr-gold shrink-0">
                <Settings size={22} strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl text-atfr-bone">Paramètres</p>
                <p className="text-xs text-atfr-fog mt-1">Timer & malus</p>
                <p className="text-sm text-atfr-fog mt-3">
                  Régler la durée d'une manche et la valeur des malus
                  (mauvaise map, time out).
                </p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
