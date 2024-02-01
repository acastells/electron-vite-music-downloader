### TODO
- similarity system
- beatport option



def webscrap_1001_tracklists(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.content, 'html.parser')

    if r.status_code == 403:
        print("\n 403 Restricted access to 1001 tracklists\n")

    tracks = []
    trackNamesSoup = soup.find_all("span", class_="trackValue")
    for track in trackNamesSoup:
        aux = track.get_text().strip()
        tracks.append(aux)

    return tracks